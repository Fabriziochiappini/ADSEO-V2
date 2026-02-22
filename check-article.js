const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkArticles() {
    console.log('Checking recent articles...');
    
    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, created_at, published_at, campaign_id')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching articles:', error);
        return;
    }

    console.log('Recent Articles:', articles);

    // Check queue
    const { data: queue, error: qError } = await supabase
        .from('article_queue')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);
        
    console.log('Recent Queue Items:', queue);
}

checkArticles();