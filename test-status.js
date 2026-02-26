import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkStatus() {
  const { data: all, error } = await supabase.from('article_queue').select('status, scheduled_at').order('scheduled_at', { ascending: false }).limit(20);
  console.log('Last 20 articles:', all);

  const { data: counts, error2 } = await supabase.rpc('get_counts_by_status'); // Just a guess, or simply fetch to group by
  
  const { data: allPending } = await supabase.from('article_queue').select('id, keyword, status, scheduled_at').eq('status', 'pending');
  console.log(`Total Pending: ${allPending?.length}`);
  if (allPending?.length > 0) {
    console.log('Sample of pending:', allPending.slice(0, 3));
  }
}

checkStatus();
