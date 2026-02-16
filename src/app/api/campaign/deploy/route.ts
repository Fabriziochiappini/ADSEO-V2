import { NextResponse } from 'next/server';
import { VercelService } from '@/lib/api/vercel';
import { AiService } from '@/lib/api/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { sites, campaignId } = await req.json();

        if (!campaignId) {
            return NextResponse.json({ error: 'Missing Campaign ID' }, { status: 400 });
        }

        const vercelToken = process.env.VERCEL_API_TOKEN;
        const teamId = process.env.VERCEL_TEAM_ID;
        const geminiKey = process.env.GEMINI_API_KEY;
        const templateRepo = process.env.LANDER_TEMPLATE_REPO || 'Fabriziochiappini/lander-template';

        if (!vercelToken || !geminiKey) {
            return NextResponse.json({ error: 'Missing API configuration (Vercel or Gemini)' }, { status: 500 });
        }

        const vercel = new VercelService(vercelToken, teamId);
        const gemini = new AiService(geminiKey);

        // 1. Fetch DNA (Keywords) from Topic 1
        const { data: keywords, error: kwError } = await supabase
            .from('keywords')
            .select('keyword')
            .eq('campaign_id', campaignId)
            .limit(30);

        if (kwError || !keywords) {
            throw new Error('Failed to fetch campaign keywords for content engine');
        }

        const deploymentResults = [];

        for (const site of sites) {
            try {
                // Check if site has minimum required content from ContentSetup
                if (!site.brandName || !site.heroTitle) {
                    console.warn(`Skipping site ${site.domain} due to missing branding content.`);
                    deploymentResults.push({
                        domain: site.domain,
                        status: 'error',
                        error: 'Missing branding content. Please generate content before launching.'
                    });
                    continue;
                }

                // 2. Initial Branding Content
                const contentJson = JSON.stringify({
                    brandName: site.brandName,
                    brandTagline: site.brandTagline || 'Eccellenza Digitale',
                    heroTitle: site.heroTitle,
                    heroSubtitle: site.heroSubtitle,
                    domain: site.domain,
                    campaignId: campaignId
                });

                // 3. Create Project with ENV VARS (to avoid race condition)
                const projectName = site.domain.replace(/\./g, '-').toLowerCase();
                const project = await vercel.createProject(projectName, templateRepo, [
                    { key: 'SITE_CONTENT', value: contentJson },
                    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL! },
                    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! }
                ]);

                // 4. Trigger Initial Deployment
                if (project.link?.repoId) {
                    console.log(`Triggering initial deployment for ${site.domain}...`);
                    await vercel.createDeployment(project.id, projectName, project.link.repoId);
                }

                // 5. Generate 5 Pillars (Cornerstone Content)
                const pillarKeywords = keywords.slice(0, 5);
                const articleQueue = keywords.slice(5, 30);

                for (const kw of pillarKeywords) {
                    const article = await gemini.generateLongFormArticle(kw.keyword);
                    await supabase.from('articles').insert({
                        campaign_id: campaignId,
                        title: article.title,
                        slug: article.slug,
                        excerpt: article.excerpt,
                        content: article.content,
                        category: article.category,
                        tags: article.tags,
                        image_url: `https://source.unsplash.com/featured/?${article.imageSearchTerm}`,
                        published_at: new Date().toISOString()
                    });
                }

                // 5. Queue 25 Articles (Drip Feed)
                const queueToInsert = articleQueue.map((kw, index) => ({
                    campaign_id: campaignId,
                    keyword: kw.keyword,
                    scheduled_at: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'pending'
                }));

                if (queueToInsert.length > 0) {
                    await supabase.from('article_queue').insert(queueToInsert);
                }

                // 6. Add Domain
                await vercel.addDomain(project.id, site.domain);

                deploymentResults.push({
                    domain: site.domain,
                    projectId: project.id,
                    status: 'deployed',
                    url: `https://${site.domain}`
                });
            } catch (err: any) {
                console.error(`Deployment failed for ${site.domain}:`, err);
                deploymentResults.push({
                    domain: site.domain,
                    status: 'error',
                    error: err.message
                });
            }
        }

        return NextResponse.json({ results: deploymentResults });

    } catch (error: any) {
        console.error('Deployment orchestration error:', error);
        return NextResponse.json(
            { error: 'Failed to orchestrate deployment', details: error.message },
            { status: 500 }
        );
    }
}
