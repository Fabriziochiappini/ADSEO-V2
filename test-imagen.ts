import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { ImageService } from './src/lib/api/images';

async function testImagen() {
    console.log('Testing Imagen 4 Fast + Supabase Upload...');
    const imageService = new ImageService();
    try {
        const keyword = "Falegname Roma laboratorio artigiano su misura";
        const slug = "test-falegname-supa-" + Date.now();
        const result = await imageService.processAndUploadImage(keyword, slug, "Falegname a Roma");

        console.log('✅ COMPLETATO!');
        console.log('🔗 URL:', result.url);
    } catch (e: any) {
        console.error('Test failed:', e.message);
    }
}

testImagen();
