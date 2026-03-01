import { supabase } from '../supabase';
import sharp from 'sharp';


const OPTIMIZED_WIDTH = 1200;
const OPTIMIZED_QUALITY = 82;

export class ImageService {
    private geminiKey: string;

    constructor(geminiKey?: string) {
        this.geminiKey = geminiKey || process.env.GEMINI_API_KEY || '';
    }

    /**
     * PRIMARY: Generate image with Imagen 4 Fast via Gemini API.
     * Converts to WebP, names it after the article slug, uploads to Supabase.
     * Alt tag is based on the article title for SEO.
     *
     * COST: ~$0.02 per image (Imagen 4 Fast)
     */
    async processAndUploadImage(
        keyword: string,
        slug: string,
        altTag?: string
    ): Promise<{ url: string; alt: string }> {
        const alt = altTag || keyword;

        try {
            // 1. Generate image with Imagen 4 Fast
            console.log(`[ImageService] Generating image with Imagen 4 Fast for: "${keyword}" (slug: ${slug})`);
            const imageBuffer = await this.generateWithImagen(keyword);

            // 2. Optimize: resize to 1200×675 (16:9), convert to WebP
            console.log(`[ImageService] Optimizing to WebP for ${slug}...`);
            const optimizedBuffer = await sharp(imageBuffer)
                .resize(OPTIMIZED_WIDTH, Math.round(OPTIMIZED_WIDTH * 9 / 16), { fit: 'cover', position: 'centre' })
                .webp({ quality: OPTIMIZED_QUALITY })
                .toBuffer();

            // 3. Upload to Supabase Storage — named with article slug
            const fileName = `${slug}.webp`;
            const path = `articles/${fileName}`;
            console.log(`[ImageService] Uploading to Supabase Storage: ${path}`);

            const { error } = await supabase.storage
                .from('media')
                .upload(path, optimizedBuffer, {
                    contentType: 'image/webp',
                    upsert: true
                });

            if (error) {
                console.warn('[ImageService] Supabase upload failed:', error.message);
                throw new Error(`Supabase upload failed: ${error.message}`);
            }

            // 4. Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('media')
                .getPublicUrl(path);

            console.log(`[ImageService] ✅ Image ready: ${publicUrlData.publicUrl}`);
            return {
                url: publicUrlData.publicUrl,
                alt
            };

        } catch (error: any) {
            console.error('[ImageService] Imagen generation failed, falling back to Pexels:', error.message);
            return this.fallbackToPexels(keyword, slug, alt);
        }
    }

    /**
     * Generate image bytes using Imagen 4 Fast via REST API ($0.02/image)
     */
    private async generateWithImagen(keyword: string): Promise<Buffer> {
        const prompt = this.buildImagePrompt(keyword);
        console.log(`[ImageService] Imagen prompt: "${prompt}"`);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${this.geminiKey}`;

        const body = {
            instances: [{ prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: '16:9',
                safetyFilterLevel: 'BLOCK_SOME',
                personGeneration: 'ALLOW_ADULT'
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Imagen API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const base64 = data.predictions?.[0]?.bytesBase64Encoded;
        if (!base64) throw new Error('Imagen returned no image data');

        return Buffer.from(base64, 'base64');
    }

    /**
     * Build a realistic, photo-style prompt from a keyword.
     * Instructs Imagen to generate a professional photo, not an illustration.
     */
    private buildImagePrompt(keyword: string): string {
        return `Professional high-quality photograph related to: "${keyword}". 
Realistic scene, natural lighting, editorial photography style. 
Shot with DSLR, sharp focus, photorealistic. 
No text, no watermark, no logos. 
Wide angle shot suitable for a website header (16:9).
Italian context when relevant (Italian city, Italian environment).`;
    }

    /**
     * FALLBACK: Pexels API when Imagen fails
     */
    private async fallbackToPexels(keyword: string, slug: string, alt: string): Promise<{ url: string; alt: string }> {
        try {
            const pexelsKey = process.env.PEXELS_API_KEY;
            if (!pexelsKey) throw new Error('No Pexels key');

            const query = encodeURIComponent(keyword);
            const response = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=5&orientation=landscape`, {
                headers: { Authorization: pexelsKey }
            });

            const data = await response.json();
            const photo = data.photos?.[0];
            if (!photo) throw new Error('No Pexels results');

            const imgResponse = await fetch(photo.src.large2x);
            const arrayBuffer = await imgResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const optimizedBuffer = await sharp(buffer)
                .resize(OPTIMIZED_WIDTH, Math.round(OPTIMIZED_WIDTH * 9 / 16), { fit: 'cover' })
                .webp({ quality: OPTIMIZED_QUALITY })
                .toBuffer();

            const fileName = `${slug}.webp`;
            const path = `articles/${fileName}`;

            const { error } = await supabase.storage.from('media')
                .upload(path, optimizedBuffer, { contentType: 'image/webp', upsert: true });

            if (error) throw new Error(error.message);

            const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(path);
            console.log(`[ImageService] ✅ Pexels fallback OK: ${publicUrlData.publicUrl}`);
            return { url: publicUrlData.publicUrl, alt };

        } catch (fallbackErr: any) {
            console.error('[ImageService] Pexels fallback also failed:', fallbackErr.message);
            // Last resort: return a placeholder that won't break the deploy
            return {
                url: `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=675&fit=crop&auto=format`,
                alt
            };
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
