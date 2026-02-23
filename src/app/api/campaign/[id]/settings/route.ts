import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
            return NextResponse.json({ error: 'No sites found for this campaign.' }, { status: 404 });
        }

        const results = [];

        for (const site of sites) {
            // Save GA ID to DB — the lander template reads it dynamically on every request
            const { error: updateErr } = await supabase
                .from('sites')
                .update({ ga_id: gaId })
                .eq('id', site.id);

            if (updateErr) {
                results.push({ domain: site.domain, status: 'error', error: updateErr.message });
            } else {
                results.push({ domain: site.domain, status: 'updated' });
            }
        }

        return NextResponse.json({ results });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
