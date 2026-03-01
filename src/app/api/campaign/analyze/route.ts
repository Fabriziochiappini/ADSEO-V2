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
        // PHASE 0 — AI Orchestrator: Topic Angle Explosion
        // ============================================================
        // Gemini explodes the topic into 6 SEMANTICALLY DIVERSE angles.
        // This is the key to getting varied results from DataForSEO.
        // ============================================================
        // PHASE 1 — DataForSEO: Source of Truth (Real Market Data)
        // ============================================================
        let realKeywords: any[] = [];

        if (dfsUser && dfsPass) {
            try {
                // PHASE 0: Generate diverse topic angles (not just seed variations)
                console.log(`[Phase 0] AI Orchestrator generating diverse topic angles for: ${topic}`);
                let angles: string[];
                try {
                    angles = await gemini.generateTopicAngles(topic, businessDescription);
                    console.log(`[Phase 0] Generated ${angles.length} diverse angles: ${JSON.stringify(angles)}`);
                } catch (angleErr) {
                    console.warn('[Phase 0] generateTopicAngles failed, falling back to seeds:', angleErr);
                    angles = await gemini.generateSeedKeywords(topic, businessDescription);
                }

                // PHASE 1: DataForSEO queries each angle independently
                console.log(`[Phase 1] Querying DataForSEO with ${angles.length} diverse angles...`);
                const dfs = new DataForSeoService({ username: dfsUser, password: dfsPass });
                const rawResults = await dfs.getKeywordIdeas(angles);

                if (rawResults && rawResults.length > 0) {
                    console.log(`[Phase 1] DataForSEO returned ${rawResults.length} raw keywords from ${angles.length} angles.`);

                    // Deduplicate, filter and rank
                    const seen = new Set<string>();
                    realKeywords = rawResults
                        .filter((k: any) => k.search_volume >= 10)
                        .filter((k: any) => k.keyword.split(' ').length >= 2)
                        .filter((k: any) => {
                            const kw = k.keyword;
                            const hasBrandPattern =
                                /\bS\.r\.l\b|\bS\.p\.A\b|\bSrl\b|\bSpA\b|\b&\s*Co\b/i.test(kw) ||
                                /[A-Z]{3,}/.test(kw);
                            return !hasBrandPattern;
                        })
                        .filter((k: any) => {
                            // Deduplicate: keep only unique keywords
                            const norm = k.keyword.toLowerCase().trim();
                            if (seen.has(norm)) return false;
                            seen.add(norm);
                            return true;
                        })
                        .map((k: any) => ({
                            ...k,
                            competition_level: k.competition_level || (k.competition < 0.3 ? 'LOW' : k.competition < 0.7 ? 'MEDIUM' : 'HIGH'),
                            source: 'DataForSEO'
                        }))
                        .sort((a: any, b: any) => (b.search_volume * (1 - b.competition)) - (a.search_volume * (1 - a.competition)))
                        .slice(0, 20);

                    console.log(`[Phase 1] Selected ${realKeywords.length} unique quality keywords from diverse angles.`);
                }
            } catch (dfsError) {
                console.error('[Phase 0/1] Analysis failed:', dfsError);
                realKeywords = [];
            }
        }

        // ============================================================
        // PHASE 2 — Gemini ATQ: Generate the 30 Final Keywords
        // ============================================================
        // Gemini reads BOTH the DFS real keywords (truth) AND the user's business
        // description to generate exactly 30 hyper-specific long-tail keywords.
        // OUTPUT = These 30 keywords. Not a mix. TOPIC 1 = these 30.

        if (realKeywords.length > 0) {
            console.log(`[Phase 2] ATQ Generation using ${realKeywords.length} real DFS keywords as truth source + business context...`);
            try {
                const atqKeywords = await gemini.generateATQExpansion(realKeywords, topic, businessDescription);
                console.log(`[Phase 2] ATQ generated ${atqKeywords.length} final long-tail keywords.`);
                analyzedKeywords = atqKeywords.slice(0, 30);
            } catch (atqError) {
                console.error('[Phase 2] ATQ failed:', atqError);
                // Fallback: use the raw DFS keywords if ATQ fails
                analyzedKeywords = realKeywords.slice(0, 30);
            }

        } else {
            // Full Gemini fallback if DataForSEO not available or returned nothing
            console.log('[Fallback] No DFS truth available. Generating 30 keywords with Gemini standalone...');
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

        return NextResponse.json({ ...result, campaignId, dfsSourceKeywords: realKeywords });
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
