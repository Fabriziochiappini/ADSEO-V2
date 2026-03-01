import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
// Re-importing after dotenv to ensure proper init
import { createClient } from '@supabase/supabase-js';
import { ImageService } from './src/lib/api/images';

async function fixUnsplashImages() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // VERY IMPORTANT: Use SERVICE ROLE key to bypass RLS for DB updates
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || !geminiKey) {
        console.error('Chiavi mancanti!');
        return;
    }

    const supabaseAdmin = createClient(url, key);
    const imageService = new ImageService(geminiKey);

    console.log('Cerco articoli con immagini Unsplash nel database...');
    const { data: articles, error } = await supabaseAdmin
        .from('articles')
        .select('*')
        .like('image_url', '%images.unsplash.com%');

    if (error) {
        console.error('Errore lettura db:', error.message);
        return;
    }

    console.log(`Trovati ${articles.length} articoli da sistemare.`);

    for (const article of articles) {
        try {
            console.log(`[FIX] Generando Imagen per: "${article.title}"`);
            const prompt = article.title; // Uso il titolo come prompt fotografico

            // 1. Usa ImageService per rigenerare, convertire WebP e caricare sul nuovo bucket 'media'
            const seoImage = await imageService.processAndUploadImage(prompt, article.slug, article.title);

            // 2. Aggiorna il DB con la nuova URL
            const { error: updateErr } = await supabaseAdmin
                .from('articles')
                .update({
                    image_url: seoImage.url,
                    alt_tag: seoImage.alt
                })
                .eq('id', article.id);

            if (updateErr) {
                console.error(`❌ Errore aggiornamento DB per ${article.slug}:`, updateErr.message);
            } else {
                console.log(`✅ OK: Sostituito con ${seoImage.url}`);
            }
        } catch (e: any) {
            console.error(`❌ Fallito img per ${article.slug}:`, e.message);
        }
    }
    console.log('Finito!');
}

fixUnsplashImages();
