import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkKwd() {
    const { data: kwd } = await supabase
        .from('article_queue')
        .select('*')
        .ilike('keyword', '%impresa movimento terra%')

    console.log("Found:", kwd);

    const { data: count, error } = await supabase.from('article_queue').select('id', { count: 'exact' }).lte('scheduled_at', new Date().toISOString()).eq('status', 'pending');
    console.log('Due count:', count?.length);
    process.exit(0);
}
checkKwd();
