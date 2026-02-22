import { supabase } from '@/lib/supabase';
import { AiService } from '@/lib/api/gemini';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
            .limit(5); // Process in small batches

        if (queueError) throw queueError;
        if (!queue || queue.length === 0) {
            return new Response(JSON.stringify({ message: 'No articles to process' }), { status: 200 });
        }

        for (const item of queue) {
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
                    image_url: `https://source.unsplash.com/featured/?${article.imageSearchTerm}`,
                    published_at: new Date().toISOString()
                });

                if (insertError) throw insertError;

                // Mark as completed
                await supabase.from('article_queue').update({ status: 'completed' }).eq('id', item.id);

            } catch (err: any) {
                console.error(`Failed to process queue item ${item.id}:`, err);
                await supabase.from('article_queue').update({ status: 'failed' }).eq('id', item.id);
            }
        }

        return new Response(JSON.stringify({ message: 'Drip feed processed', count: queue.length }), { status: 200 });

    } catch (error: any) {
        console.error('Drip feed error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
