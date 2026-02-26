import { supabase } from '@/lib/supabase';
import { AiService } from '@/lib/api/gemini';

export const maxDuration = 300; // Allow sufficient time for batch processing
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const userAgent = req.headers.get('user-agent');

        // Allow if secret matches OR if it's Vercel Cron internal scheduler
        const isVercelCron = userAgent === 'vercel-cron/1.0';
        const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}`;

        if (!isVercelCron && !isAuthorized) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
            });
        }

        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error('Missing GEMINI_API_KEY');

        const gemini = new AiService(geminiKey);

        // 1. Fetch articles due for publication
        const { data: queue, error: queueError } = await supabase
            .from('article_queue')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_at', new Date().toISOString())
            .limit(50); // Process in a larger batch (max 50 per day)

        if (queueError) throw queueError;
        if (!queue || queue.length === 0) {
            return new Response(JSON.stringify({ message: 'No articles to process' }), { status: 200 });
        }

        const startTime = Date.now();
        const MAX_EXECUTION_TIME = 270 * 1000; // 270 seconds (safe buffer before 300s Vercel limit)
        let processedCount = 0;

        for (const item of queue) {
            // Check if we are running out of time to avoid Vercel timeout killing the function
            if (Date.now() - startTime > MAX_EXECUTION_TIME) {
                console.log('Approaching Vercel 5-minute timeout limit. Stopping batch early.');
                break;
            }

            try {
                // Update status to processing
                await supabase.from('article_queue').update({ status: 'processing' }).eq('id', item.id);

                // Generate Article
                const article = await gemini.generateLongFormArticle(item.keyword);

                // Insert into articles table
                const { error: insertError } = await supabase.from('articles').insert({
                    campaign_id: item.campaign_id,
                    title: article.title,
                    slug: article.slug,
                    excerpt: article.excerpt,
                    content: article.content,
                    category: article.category,
                    tags: article.tags,
                    image_url: `https://loremflickr.com/1200/800/${(article.imageSearchTerm || 'seo,marketing').replace(/\s+/g, ',')}`,
                    published_at: new Date().toISOString()
                });

                if (insertError) throw insertError;

                // Mark as completed
                await supabase.from('article_queue').update({ status: 'completed' }).eq('id', item.id);
                processedCount++;

            } catch (err: any) {
                console.error(`Failed to process queue item ${item.id}:`, err);
                await supabase.from('article_queue').update({ status: 'failed' }).eq('id', item.id);
            }
        }

        return new Response(JSON.stringify({ message: 'Drip feed processed', count: processedCount }), { status: 200 });

    } catch (error: any) {
        console.error('Drip feed error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
