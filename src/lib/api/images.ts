import { supabase } from '../supabase';
import sharp from 'sharp';

const OPTIMIZED_WIDTH = 1200;
const OPTIMIZED_QUALITY = 80;

// Sorgenti multiple per varietà (Unsplash Source è deprecato ma queste query URL funzionano)
const IMAGE_SOURCES = [
    'https://images.unsplash.com/photo-X?auto=format&fit=crop&q=80&w=1200',
    'https://source.unsplash.com/featured/1200x675/?', // Fallback
];

export class ImageService {
    /**
     * Genera un URL stabile basato su un seed o query, lo scarica, 
     * lo ottimizza e lo carica su Supabase.
     */
    async processAndUploadImage(keyword: string, slug: string): Promise<string> {
        try {
            // 1. Fetch random professional image based on keyword
            // Usiamo una combinazione di Pixabay/Unsplash random URLs
            const query = encodeURIComponent(keyword.toLowerCase().replace(/\s+/g, ','));
            const randomSeed = Math.abs(this.hashCode(slug)) % 1000;

            // Rotazione sorgenti professionali basate sulla keyword per massimizzare la rilevanza
            const sources = [
                `https://source.unsplash.com/featured/1200x675/?${query}&sig=${randomSeed}`,
                `https://loremflickr.com/1200/675/${query}?lock=${randomSeed}`,
                `https://picsum.photos/seed/${randomSeed}/1200/675`
            ];

            let sourceUrl = sources[randomSeed % sources.length];

            console.log(`[ImageService] Fetching from ${sourceUrl} for ${slug}`);
            const response = await fetch(sourceUrl);
            if (!response.ok) throw new Error('Failed to download source image');

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 2. Ottimizzazione con Sharp (WEBP per velocità e LCP)
            console.log(`[ImageService] Optimizing ${slug}...`);
            const optimizedBuffer = await sharp(buffer)
                .resize(OPTIMIZED_WIDTH, Math.round(OPTIMIZED_WIDTH * 9 / 16), { fit: 'cover' })
                .webp({ quality: OPTIMIZED_QUALITY })
                .toBuffer();

            // 3. Upload a Supabase Storage
            const fileName = `${slug}.webp`;
            const bucketName = 'media';
            const path = `articles/${fileName}`;

            console.log(`[ImageService] Uploading to Supabase: ${path}`);

            // Nota: we use the standard anon client, but if RLS is tight, this might fail.
            // In production we should use a service role key.
            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(path, optimizedBuffer, {
                    contentType: 'image/webp',
                    upsert: true
                });

            if (error) {
                console.warn('[ImageService] Upload failed, falling back to original URL:', error.message);
                // Fallback: se lo storage fallisce, restituiamo l'URL originale ma con SEO naming param
                return `${sourceUrl}?f=${slug}.webp`;
            }

            // 4. Get Public URL
            const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(path);
            return publicUrlData.publicUrl;

        } catch (error: any) {
            console.error('[ImageService] Critical Error:', error.message);
            // Estremo fallback per non bloccare il deploy
            return `https://source.unsplash.com/featured/1200x675/?${encodeURIComponent(keyword)}&f=${slug}.webp`;
        }
    }

    private hashCode(s: string): number {
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            hash = (hash << 5) - hash + s.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }
}
