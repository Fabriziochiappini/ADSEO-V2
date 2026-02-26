import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkKwd() {
    const { data: cols } = await supabase.from('article_queue').select('*').eq('status', 'completed');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Filter manually if there's no updated_at column
    // Wait, let's just see how many completed articles we have.
    const { data: compl } = await supabase.from('article_queue').select('*').eq('status', 'completed');
    console.log("Total completed:", compl?.length);
    process.exit(0);
}
checkKwd();
