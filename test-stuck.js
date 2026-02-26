import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkProcessing() {
  const { data: stuck } = await supabase.from('article_queue').select('*').in('status', ['processing', 'failed']);
  console.log("Stuck/Failed:", stuck?.length);
  if (stuck?.length) {
      console.log(stuck[0]);
  }
}
checkProcessing();
