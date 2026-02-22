import { supabase } from '@/lib/supabase';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Next.js 15+ params should be awaited
    const { id } = await params;

    try {
        // 1. Get Campaign
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (campaignError) throw campaignError;

        // 2. Get Articles (Published)
        const { data: articles, error: articlesError } = await supabase
            .from('articles')
            .select('id, title, slug, published_at, image_url')
            .eq('campaign_id', id)
            .order('published_at', { ascending: false });

        // 3. Get Queue (Pending/Scheduled)
        const { data: queue, error: queueError } = await supabase
            .from('article_queue')
            .select('*')
            .eq('campaign_id', id)
            .order('scheduled_at', { ascending: true });

        // 4. Get Keywords (All)
        const { data: keywords, error: keywordsError } = await supabase
            .from('keywords')
            .select('*')
            .eq('campaign_id', id);

        return new Response(JSON.stringify({
            ...campaign,
            articles: articles || [],
            queue: queue || [],
            keywords: keywords || []
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}