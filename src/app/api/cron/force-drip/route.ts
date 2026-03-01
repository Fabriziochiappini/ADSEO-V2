import { supabase } from '@/lib/supabase';
import { AiService } from '@/lib/api/gemini';
import { NewsService } from '@/lib/api/news';
import { ImageService } from '@/lib/api/images';
import { getDynamicImageUrl } from '@/lib/utils/image-utils';

export async function POST(req: Request) {
    try {
        const { force = false, limit = 5 } = await req.json();

        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error('Missing GEMINI_API_KEY');

        const gemini = new AiService(geminiKey);
        const newsService = new NewsService();
        const imageService = new ImageService();

        // Query per trovare articoli da pubblicare
        let query = supabase
            .from('article_queue')
            .select('*')
            .eq('status', 'pending');

        if (!force) {
            // Solo articoli con scheduled_at nel passato
            query = query.lte('scheduled_at', new Date().toISOString());
        }

        const { data: queue, error: queueError } = await query.limit(limit);

        if (queueError) throw queueError;
        if (!queue || queue.length === 0) {
            return new Response(JSON.stringify({
                message: 'No articles to process',
                force: force,
                limit: limit
            }), { status: 200 });
        }

        const results: {
            processed: number;
            failed: number;
            articles: Array<{ id: any; title: any; keyword: any }>;
        } = {
            processed: 0,
            failed: 0,
            articles: []
        };

        for (const item of queue) {
            try {
                // Update status to processing
                await supabase.from('article_queue').update({ status: 'processing' }).eq('id', item.id);

                // Fetch real-time context
                const news = await newsService.getNewsForKeyword(item.keyword);
                const context = newsService.formatNewsForAi(news);

                // Generate Article & Optimize Image
                const article = await gemini.generateLongFormArticle(item.keyword, context);
                const seoImageUrl = await imageService.processAndUploadImage(article.imageSearchTerm || article.title, article.slug);

                // Insert into articles table
                const { error: insertError } = await supabase.from('articles').insert({
                    campaign_id: item.campaign_id,
                    title: article.title,
                    slug: article.slug,
                    excerpt: article.excerpt,
                    content: article.content,
                    category: article.category,
                    tags: article.tags,
                    image_url: seoImageUrl,
                    published_at: new Date().toISOString()
                });

                if (insertError) throw insertError;

                // Mark as completed
                await supabase.from('article_queue').update({ status: 'completed' }).eq('id', item.id);

                results.processed++;
                results.articles.push({
                    id: item.id,
                    title: article.title,
                    keyword: item.keyword
                });

            } catch (err: any) {
                console.error(`Failed to process queue item ${item.id}:`, err);
                await supabase.from('article_queue').update({ status: 'failed' }).eq('id', item.id);
                results.failed++;
            }
        }

        return new Response(JSON.stringify({
            message: 'Force drip feed processed',
            results: results,
            force: force
        }), { status: 200 });

    } catch (error: any) {
        console.error('Force drip feed error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}