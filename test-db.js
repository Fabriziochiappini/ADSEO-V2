import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let envContent;
try {
  envContent = fs.readFileSync('.env.local', 'utf-8');
} catch (e) {
  envContent = fs.readFileSync('.env', 'utf-8');
}
const matchUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const matchKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/) || envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(matchUrl[1].trim(), matchKey[1].trim());

async function run() {
  const { data: articles, error: err1 } = await supabase.from('articles').select('title, keyword, created_at').order('created_at', { ascending: false }).limit(6);
  console.log("RECENT ARTICLES:");
  console.log(err1 || articles);

  const { data: queue, error: err2 } = await supabase.from('article_queue').select('keyword, status, scheduled_at').order('created_at', { ascending: false }).limit(6);
  console.log("RECENT QUEUE:");
  console.log(err2 || queue);
}
run();
