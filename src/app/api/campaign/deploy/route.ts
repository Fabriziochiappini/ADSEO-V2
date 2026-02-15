import { NextResponse } from 'next/server';
import { VercelService } from '@/lib/api/vercel';

export async function POST(req: Request) {
    try {
        const { sites } = await req.json(); // Array of site configuration objects

        const vercelToken = process.env.VERCEL_API_TOKEN;
        const teamId = process.env.VERCEL_TEAM_ID;
        // We should have a template repo in env
        const templateRepo = process.env.LANDER_TEMPLATE_REPO || 'Fabriziochiappini/lander-template';

        if (!vercelToken) {
            return NextResponse.json({ error: 'Missing Vercel API Token' }, { status: 500 });
        }

        const vercel = new VercelService(vercelToken, teamId);
        const deploymentResults = [];

        for (const site of sites) {
            try {
                // 1. Create Project
                const projectName = site.domain.replace(/\./g, '-').toLowerCase();
                const project = await vercel.createProject(projectName, templateRepo);

                // 2. Set Env Var for content (serialized JSON)
                const contentJson = JSON.stringify({
                    brandName: site.brandName,
                    heroTitle: site.heroTitle,
                    heroSubtitle: site.heroSubtitle,
                    serviceDescription: site.serviceDescription,
                    ctaText: site.ctaText,
                    keyword: site.keyword
                });

                await vercel.setEnvVariable(project.id, 'SITE_CONTENT', contentJson);

                // 3. Add Domain
                await vercel.addDomain(project.id, site.domain);

                deploymentResults.push({
                    domain: site.domain,
                    projectId: project.id,
                    status: 'deployed',
                    url: `https://vercel.com/dashboard/projects/${projectName}`
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
            { error: 'Failed to orchestrate deployment' },
            { status: 500 }
        );
    }
}
