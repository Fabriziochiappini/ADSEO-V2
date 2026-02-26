import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkDue() {
  const { data: pending } = await supabase
    .from('article_queue')
    .select('keyword, scheduled_at, status')
    .eq('status', 'pending')
    .order('scheduled_at', { ascending: true })
    .limit(10);
    
  console.log("Current Time:", new Date().toISOString());
  console.log("Next pending articles:", pending);
}
checkDue();
