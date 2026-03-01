import { NextRequest, NextResponse } from 'next/server';
import { AiService } from '@/lib/api/gemini';
import { DataForSeoService } from '@/lib/api/dataforseo';
import { Keyword, TopicAnalysisResult } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const { topic, businessDescription } = await req.json();

        if (!topic || !businessDescription) {
            return NextResponse.json({ error: 'Topic and business description are required' }, { status: 400 });
        }

        const geminiKey = process.env.GEMINI_API_KEY;
        const dfsUser = process.env.DATAFORSEO_USERNAME;
        const dfsPass = process.env.DATAFORSEO_PASSWORD;

        if (!geminiKey) {
            return NextResponse.json({
                error: 'Server configuration error: Missing GEMINI_API_KEY.'
            }, { status: 500 });
        }

        const gemini = new AiService(geminiKey);
        let analyzedKeywords: any[] = [];

        // ============================================================
        // PHASE 1 — DataForSEO: Source of Truth (Real Market Data)
        // ============================================================
        let realKeywords: any[] = [];

        if (dfsUser && dfsPass) {
            console.log(`[Phase 1] Starting DataForSEO real-market analysis for: ${topic}`);
            try {
                // A. Gemini generates broad "Smart Seeds" (topic-agnostic)
                const seeds = await gemini.generateSeedKeywords(topic, businessDescription);
                console.log(`[Phase 1] Gemini seeds: ${JSON.stringify(seeds)}`);

                // B. DataForSEO expands these seeds with real volume & competition data
                const dfs = new DataForSeoService({ username: dfsUser, password: dfsPass });
                const rawResults = await dfs.getKeywordIdeas(seeds);

                if (rawResults && rawResults.length > 0) {
                    console.log(`[Phase 1] DataForSEO returned ${rawResults.length} real keywords.`);

                    realKeywords = rawResults
                        .filter((k: any) => k.search_volume >= 10)
                        .filter((k: any) => k.keyword.split(' ').length >= 2)
                        // Filter out brand names (any keyword with a capital letter mid-sentence is likely a brand)
                        .filter((k: any) => {
                            const words = k.keyword.split(' ');
                            const hasBrandName = words.slice(1).some((w: string) => /^[A-Z]/.test(w));
                            return !hasBrandName;
                        })
                        .map((k: any) => ({
                            ...k,
                            competition_level: k.competition_level || (k.competition < 0.3 ? 'LOW' : k.competition < 0.7 ? 'MEDIUM' : 'HIGH'),
                            source: 'DataForSEO'
                        }))
                        .sort((a: any, b: any) => (b.search_volume * (1 - b.competition)) - (a.search_volume * (1 - a.competition)))
                        .slice(0, 20); // Top 20 real keywords as foundation

                    console.log(`[Phase 1] Selected ${realKeywords.length} quality real keywords.`);
                }
            } catch (dfsError) {
                console.error('[Phase 1] DataForSEO failed:', dfsError);
                realKeywords = [];
            }
        }

        // ============================================================
        // PHASE 2 — Gemini ATQ Expansion: "Answer The Question"
        // ============================================================
        // If we have real keywords, use them as the source of truth for expansion.
        // If DataForSEO failed or not configured, gemini works standalone.

        if (realKeywords.length > 0) {
            console.log(`[Phase 2] Starting ATQ Expansion based on ${realKeywords.length} real DataForSEO keywords...`);
            try {
                const atqKeywords = await gemini.generateATQExpansion(realKeywords, topic);
                console.log(`[Phase 2] ATQ generated ${atqKeywords.length} long-tail expansions.`);

                // Combine: Real keywords first (priority), then ATQ expansions
                const realSet = new Set(realKeywords.map((k: any) => k.keyword.toLowerCase()));
                const uniqueATQ = atqKeywords.filter(k => !realSet.has(k.keyword.toLowerCase()));

                analyzedKeywords = [
                    ...realKeywords,
                    ...uniqueATQ
                ].slice(0, 50); // Max 50 total

            } catch (atqError) {
                console.error('[Phase 2] ATQ Expansion failed, using DataForSEO results only:', atqError);
                analyzedKeywords = realKeywords;
            }

        } else {
            // Full Gemini fallback if DataForSEO not available or returned nothing
            console.log('[Fallback] No real keywords. Generating with Gemini standalone...');
            try {
                analyzedKeywords = await gemini.generateKeywordsWithMetrics(topic, businessDescription);
            } catch (err: any) {
                throw new Error(`Keyword generation failed entirely: ${err.message}`);
            }
        }

        if (!analyzedKeywords || analyzedKeywords.length === 0) {
            throw new Error('Analysis returned no results (both DataForSEO and AI failed).');
        }

        const realCount = analyzedKeywords.filter((k: any) => k.source === 'DataForSEO').length;
        const atqCount = analyzedKeywords.filter((k: any) => k.source?.includes('ATQ')).length;
        const descriptionParts = [];
        if (realCount > 0) descriptionParts.push(`${realCount} keyword reali (DataForSEO)`);
        if (atqCount > 0) descriptionParts.push(`${atqCount} long-tail ATQ (Gemini)`);
        if (descriptionParts.length === 0) descriptionParts.push(`${analyzedKeywords.length} keyword (Gemini AI)`);

        const result: TopicAnalysisResult = {
            name: "TOPIC 1",
            description: `"${topic}" — ${descriptionParts.join(' + ')}`,
            keywords: analyzedKeywords
        };

        // --- Save to Supabase (Foundation) ---
        let campaignId: string | null = null;
        try {
            const { supabase } = await import('@/lib/supabase');
            const appId = 'adseo-v2';

            const { data: campaign, error: campaignError } = await supabase
                .from('campaigns')
                .insert({
                    topic: topic,
                    description: businessDescription,
                    app_id: appId
                })
                .select()
                .single();

            if (campaignError) {
                console.error('Supabase Campaign Save Error:', campaignError);
            } else if (campaign) {
                campaignId = campaign.id;
                const keywordsToInsert = analyzedKeywords.map(k => ({
                    campaign_id: campaign.id,
                    keyword: k.keyword,
                    search_volume: k.search_volume,
                    competition: k.competition,
                    cpc: k.cpc,
                    app_id: appId,
                    // Note: Supabase 'keywords' table might not have 'source' column yet.
                    // If you want to persist the source, you need to add the column in Supabase first.
                    // For now, we return it in the JSON response for the frontend.
                }));

                const { error: keywordsError } = await supabase
                    .from('keywords')
                    .insert(keywordsToInsert);

                if (keywordsError) {
                    console.error('Supabase Keywords Save Error:', keywordsError);
                }
            }
        } catch (dbErr) {
            console.error('Database operation failed:', dbErr);
        }

        return NextResponse.json({ ...result, campaignId });
    } catch (error: any) {
        console.error('Analysis failed:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to analyze campaign',
                details: error.stack
            },
            { status: 500 }
        );
    }
}
