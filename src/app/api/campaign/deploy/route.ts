import { NextResponse } from 'next/server';
import { VercelService } from '@/lib/api/vercel';
import { AiService } from '@/lib/api/gemini';
import { KnowledgeService } from '@/lib/api/knowledge';
import { supabase } from '@/lib/supabase';
import { namecheap } from '@/lib/api/namecheap';
import { github } from '@/lib/api/github';
import { ImageService } from '@/lib/api/images';

export const maxDuration = 300; // 5 min for full campaign deployment

export async function POST(req: Request) {
    try {
        const { sites, campaignId, publishingFrequency = '1d', connectDomain = false, dnsMethod = 'ns' } = await req.json();

        if (!campaignId) {
            return NextResponse.json({ error: 'Missing Campaign ID' }, { status: 400 });
        }

        const vercelToken = process.env.VERCEL_API_TOKEN;
        const teamId = process.env.VERCEL_TEAM_ID;
        const geminiKey = process.env.GEMINI_API_KEY;
        // Template source (GitHub user/repo)
        const templateRepoFull = process.env.LANDER_TEMPLATE_REPO || 'Fabriziochiappini/lander-template';
        const [templateOwner, templateName] = templateRepoFull.split('/');

        if (!vercelToken || !geminiKey) {
            return NextResponse.json({ error: 'Missing API configuration (Vercel or Gemini)' }, { status: 500 });
        }

        const vercel = new VercelService(vercelToken, teamId);
        const gemini = new AiService(geminiKey);
        const knowledge = new KnowledgeService();
        const imageService = new ImageService(geminiKey);

        // 1. Fetch DNA (Keywords) from Topic 1
        const { data: keywords, error: kwError } = await supabase
            .from('keywords')
            .select('keyword')
            .eq('campaign_id', campaignId)
            .limit(30);

        if (kwError || !keywords) {
            throw new Error('Failed to fetch campaign keywords for content engine');
        }

        // Determine Interval in MS
        let intervalMs = 24 * 60 * 60 * 1000; // default 1d
        if (publishingFrequency === '1d') intervalMs = 24 * 60 * 60 * 1000;
        else if (publishingFrequency === '3d') intervalMs = 3 * 24 * 60 * 60 * 1000;
        else if (publishingFrequency === '7d') intervalMs = 7 * 24 * 60 * 60 * 1000;
        else if (publishingFrequency === '30d') intervalMs = 30 * 24 * 60 * 60 * 1000;
        else intervalMs = 24 * 60 * 60 * 1000; // fallback to 1d for safety

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
                    brandAuthorRole: site.brandAuthorRole || 'Redazione Specializzata',
                    heroTitle: site.heroTitle,
                    heroSubtitle: site.heroSubtitle,
                    servicesTitle: site.servicesTitle,
                    servicesSubtitle: site.servicesSubtitle,
                    services: site.services,
                    articlesTitle: site.articlesTitle,
                    guideHeroTitle: site.guideHeroTitle,
                    guideHeroSubtitle: site.guideHeroSubtitle,
                    guides: site.guides,
                    guideCtaTitle: site.guideCtaTitle,
                    guideCtaSubtitle: site.guideCtaSubtitle,
                    guideCtaText: site.guideCtaText,
                    siteTitle: site.siteTitle,
                    metaDescription: site.metaDescription,
                    footerQuote: site.footerQuote,
                    youtubeVideoId: site.youtubeVideoId,
                    domain: site.domain,
                    campaignId: campaignId,
                    // Extended Services Content (AI Agent)
                    servicesMetaDescription: site.servicesMetaDescription,
                    servicesHeroTitle: site.servicesHeroTitle,
                    servicesHeroSubtitle: site.servicesHeroSubtitle,
                    extendedServices: site.extendedServices,
                    whyChooseUsTitle: site.whyChooseUsTitle,
                    whyChooseUsSubtitle: site.whyChooseUsSubtitle,
                    whyChooseUsPoints: site.whyChooseUsPoints,
                    servicesCtaTitle: site.servicesCtaTitle,
                    servicesCtaSubtitle: site.servicesCtaSubtitle,
                    servicesCtaText: site.servicesCtaText,
                    servicesFooterQuote: site.servicesFooterQuote,
                    // About Us Content
                    aboutTitle: site.aboutTitle,
                    aboutIntro: site.aboutIntro,
                    aboutTeam: site.aboutTeam,
                    aboutConclusion: site.aboutConclusion,
                    aboutExcerpt: site.aboutExcerpt,
                    imageSearchTerm1: site.imageSearchTerm1,
                    imageSearchTerm2: site.imageSearchTerm2
                });

                // 3. Create NEW REPO for this site (Cloning Template)
                const sanitizedDomain = site.domain.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
                const newRepoName = `adseo-${sanitizedDomain}`; // e.g. adseo-sgomberofrosinone-it

                console.log(`Creating dedicated repo for ${site.domain}: ${newRepoName}...`);
                const repo = await github.createRepoFromTemplate(templateOwner, templateName, newRepoName, true); // Private repo
                const newRepoFullName = repo.full_name; // e.g. Fabriziochiappini/adseo-sgomberofrosinone-it

                // 4. Create Project linked to the NEW REPO
                const projectName = sanitizedDomain;
                console.log(`Creating Vercel project ${projectName} linked to ${newRepoFullName}...`);

                const project = await vercel.createProject(projectName, newRepoFullName, [
                    { key: 'SITE_CONTENT', value: contentJson },
                    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL! },
                    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
                    { key: 'ADSEO_API_URL', value: process.env.ADSEO_API_URL || '' }
                ]);

                // 5. Generate 5 Pillars (Cornerstone Content) BEFORE Deployment
                const pillarKeywords = keywords.slice(0, 5);
                const articleQueue = keywords.slice(5, 30);

                let pillarIdx = 0;
                for (const kw of pillarKeywords) {
                    console.log(`[Pillar] Generating ${pillarIdx + 1}/5: ${kw.keyword} for ${site.domain}`);
                    const sources = await knowledge.fetchAllContext(kw.keyword);
                    const context = knowledge.formatContextForAi(sources);

                    const article = await gemini.generateLongFormArticle(kw.keyword, context);

                    // Processing Image: Imagen 4 Fast → WebP → Supabase (named with slug, with alt tag)
                    const seoImage = await imageService.processAndUploadImage(
                        article.imageSearchTerm || article.title,
                        article.slug,
                        article.title  // alt tag = article title for SEO
                    );

                    await supabase.from('articles').insert({
                        campaign_id: campaignId,
                        title: article.title,
                        slug: article.slug,
                        excerpt: article.excerpt,
                        content: article.content,
                        category: article.category,
                        tags: article.tags,
                        image_url: seoImage.url,
                        alt_tag: seoImage.alt,
                        author: article.author,
                        author_role: article.authorRole,
                        published_at: new Date().toISOString()
                    });
                    pillarIdx++;
                }

                // 6. Trigger Initial Deployment (now that DB has content)
                let deploymentUrl = `https://${projectName}.vercel.app`;
                if (project.link?.repoId) {
                    console.log(`Triggering initial deployment for ${site.domain}...`);
                    const deployment = await vercel.createDeployment(project.id, projectName, project.link.repoId);
                    if (deployment && deployment.url) {
                        deploymentUrl = `https://${deployment.url}`;
                    }
                }

                // 7. Queue 25 Articles (Drip Feed) with randomized jitter to break rhythmic footprints
                const queueToInsert = articleQueue.map((kw, index) => {
                    const baseDelay = (index + 1) * intervalMs;
                    // Add a random jitter of +/- 24 hours (48h total window)
                    const jitter = Math.floor(Math.random() * 48 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000);
                    let scheduledTime = Date.now() + baseDelay + jitter;

                    // Safety: ensure scheduling is at least 30 minutes in the future
                    const minFuture = Date.now() + 30 * 60 * 1000;
                    if (scheduledTime < minFuture) scheduledTime = minFuture;

                    return {
                        campaign_id: campaignId,
                        keyword: kw.keyword,
                        scheduled_at: new Date(scheduledTime).toISOString(),
                        status: 'pending'
                    };
                });

                if (queueToInsert.length > 0) {
                    await supabase.from('article_queue').insert(queueToInsert);
                }

                // 8. Add Domain to Vercel
                await vercel.addDomain(project.id, site.domain);

                // 9. Purchase and link via Namecheap
                if (connectDomain) {
                    console.log(`Attempting to register and link domain: ${site.domain}`);
                    const registered = await namecheap.registerDomain(site.domain);
                    if (registered) {
                        // Sleep a bit before setting DNS
                        await new Promise(resolve => setTimeout(resolve, 3000));

                        let dnsSuccess = false;
                        if (dnsMethod === 'records') {
                            console.log(`Setting DNS Records (A/CNAME) for ${site.domain}...`);
                            dnsSuccess = await namecheap.setVercelRecords(site.domain);
                        } else {
                            console.log(`Setting Nameservers (NS) for ${site.domain}...`);
                            dnsSuccess = await namecheap.setVercelDNS(site.domain);
                        }

                        console.log(`DNS configuration for ${site.domain}:`, dnsSuccess ? 'Success' : 'Failed');
                    } else {
                        console.warn(`Failed to register domain ${site.domain}`);
                    }
                }

                deploymentResults.push({
                    domain: site.domain,
                    projectId: project.id,
                    status: 'deployed',
                    url: deploymentUrl,
                    repo: newRepoFullName, // Track which repo was created
                    dnsMethod: dnsMethod // Report which method was used
                });

                // 10. Save Site to DB (for future management like Analytics)
                const { error: siteInsertErr } = await supabase.from('sites').insert({
                    campaign_id: campaignId,
                    domain: site.domain.toLowerCase(),
                    vercel_project_id: project.id,
                    repo_name: newRepoFullName
                });
                if (siteInsertErr) {
                    console.warn('Failed to save site to DB:', siteInsertErr.message);
                }
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
