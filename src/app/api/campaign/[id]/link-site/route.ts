import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/campaign/[id]/link-site
 * Manually links a site (domain + vercel project id) to a campaign.
 * Used when the sites record was not created during deployment.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: campaignId } = await params;
        const { domain, vercelProjectId } = await req.json();

        if (!domain) {
            return NextResponse.json({ error: 'Missing domain' }, { status: 400 });
        }

        // Check if already exists
        const { data: existing } = await supabase
            .from('sites')
            .select('id')
            .eq('campaign_id', campaignId)
            .eq('domain', domain)
            .single();

        if (existing) {
            return NextResponse.json({ success: true, message: 'Site already linked', id: existing.id });
        }

        const { data, error } = await supabase
            .from('sites')
            .insert({
                campaign_id: campaignId,
                domain: domain.trim().toLowerCase().replace(/^https?:\/\//, ''),
                vercel_project_id: vercelProjectId?.trim() || null,
            })
            .select()
            .single();

        if (error) {
            // Table might not exist yet
            if (error.code === '42P01') {
                return NextResponse.json({
                    error: 'La tabella "sites" non esiste su Supabase. Eseguila dal pannello Supabase SQL Editor.',
                    sql: `CREATE TABLE IF NOT EXISTS public.sites (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  domain text not null,
  vercel_project_id text,
  repo_name text,
  deployment_url text,
  ga_id text
);
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access" ON public.sites FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_sites_campaign_id ON public.sites(campaign_id);`
                }, { status: 500 });
            }
            throw error;
        }

        return NextResponse.json({ success: true, site: data });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
