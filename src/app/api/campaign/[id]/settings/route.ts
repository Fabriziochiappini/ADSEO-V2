import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { VercelService } from '@/lib/api/vercel';

const vercelToken = process.env.VERCEL_API_TOKEN!;
const teamId = process.env.VERCEL_TEAM_ID;
const vercel = new VercelService(vercelToken, teamId);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const campaignId = id;
        const { gaId } = await req.json();

        if (!gaId) {
            return NextResponse.json({ error: 'Missing GA ID' }, { status: 400 });
        }

        // 1. Get sites for this campaign
        const { data: sites, error } = await supabase
            .from('sites')
            .select('*')
            .eq('campaign_id', campaignId);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Database error accessing sites table' }, { status: 500 });
        }

        if (!sites || sites.length === 0) {
            return NextResponse.json({ error: 'No sites found for this campaign. Ensure "sites" table is populated.' }, { status: 404 });
        }

        const results = [];

        for (const site of sites) {
            if (!site.vercel_project_id) {
                results.push({ domain: site.domain, status: 'skipped', reason: 'Missing Vercel Project ID' });
                continue;
            }

            // 2. Update DB
            await supabase.from('sites').update({ ga_id: gaId }).eq('id', site.id);

            // 3. Update Vercel Env Var
            try {
                await vercel.setEnvVariable(site.vercel_project_id, 'NEXT_PUBLIC_GA_ID', gaId);
                
                // 4. Trigger Redeploy
                // Fetch project to get repoId
                // The getProject method supports ID or Name
                const project = await vercel.getProject(site.vercel_project_id);
                
                if (project && project.link?.repoId) {
                     await vercel.createDeployment(site.vercel_project_id, project.name, project.link.repoId);
                     results.push({ domain: site.domain, status: 'updated_and_redeploying' });
                } else {
                     results.push({ domain: site.domain, status: 'updated_env_only', reason: 'Repo link not found' });
                }

            } catch (vErr: any) {
                console.error(vErr);
                results.push({ domain: site.domain, status: 'error', error: vErr.message });
            }
        }

        return NextResponse.json({ results });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
