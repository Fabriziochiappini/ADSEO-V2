import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function checkSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Uso la SERVICE ROLE KEY se c'è, altrimenti la ANON KEY
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('Chiavi mancanti!');
        return;
    }

    const supabase = createClient(url, key);

    console.log('Controllo i bucket...');
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Errore lettura bucket:', error.message);
    } else {
        console.log('Buckets trovati:', buckets.map(b => b.name));

        const hasMedia = buckets.some(b => b.name === 'media');
        if (!hasMedia) {
            console.log('Il bucket "media" NON ESISTE. Provo a crearlo...');
            const { error: createErr } = await supabase.storage.createBucket('media', { public: true });
            if (createErr) console.error('Errore creazione bucket:', createErr.message);
            else console.log('Bucket "media" creato con successo e reso pubblico!');
        } else {
            console.log('Il bucket "media" esiste già. Provo un upload di test...');
            const testBuffer = Buffer.from('test', 'utf-8');
            const { error: uploadErr } = await supabase.storage.from('media').upload('test.txt', testBuffer, { upsert: true });
            if (uploadErr) console.error('Errore UPLOAD (probabile policy RLS):', uploadErr.message);
            else console.log('Upload riuscito! Permessi OK.');
        }
    }
}

checkSupabase();
