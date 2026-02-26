import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkQueue() {
  const { data, error } = await supabase.from('article_queue').select('*').order('scheduled_at', { ascending: true }).limit(5);
  console.log('Error:', error);
  console.log('Data:', data);
  console.log('Current ISO:', new Date().toISOString());
  
  // Also let's check what is due
  const { data: dueData, error: dueError } = await supabase
            .from('article_queue')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_at', new Date().toISOString())
            .limit(5);
  console.log('Due Error:', dueError);
  console.log('Due Data length:', dueData?.length);
  if (dueData?.length) console.log('Due Data sample:', dueData[0]);
}

checkQueue();
