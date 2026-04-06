import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/ga-config?domain=example.com
 * Public endpoint — returns GA ID for the given domain.
 * Called by the lander template at server render time (no redeploy needed).
 */
export async function GET(req: NextRequest) {
    const domain = req.nextUrl.searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    // Normalize: lowercase, strip protocol and trailing slash
    // (SITE_CONTENT may have mixed-case domains like 'RumeniLatina.online')
    const normalizedDomain = domain
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');

    const { data, error } = await supabase
        .from('sites')
        .select('ga_id')
        .ilike('domain', normalizedDomain)
        .maybeSingle();

    // Define caching headers
    const cacheHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    };

    if (error || !data) {
        // Return empty — site just won't have GA tracking
        return NextResponse.json({ ga_id: null }, { headers: cacheHeaders });
    }

    return NextResponse.json({ ga_id: data.ga_id || null }, { headers: cacheHeaders });
}
