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

        // 1. Try DataForSEO First (Real Data) with Gemini Seeds
        if (dfsUser && dfsPass) {
            console.log(`Starting Hybrid Analysis (Gemini + DataForSEO) for topic: ${topic}`);
            try {
                // A. Gemini generates "Smart Seeds"
                const seeds = await gemini.generateSeedKeywords(topic, businessDescription);
                console.log(`Gemini generated seeds: ${JSON.stringify(seeds)}`);

                // B. DataForSEO expands these seeds
                const dfs = new DataForSeoService({ username: dfsUser, password: dfsPass });
                const rawResults = await dfs.getKeywordIdeas(seeds);
                
                if (rawResults && rawResults.length > 0) {
                    console.log(`DataForSEO returned ${rawResults.length} raw ideas.`);
                    
                    // C. Filter & Rank
                    // 1. Remove low volume trash (< 10)
                    // 2. Remove too short keywords (1 word)
                    // 3. Sort by "Efficiency" (Volume / Competition) or just Volume if Competition is low
                    
                    analyzedKeywords = rawResults
                        .filter((k: Keyword) => k.search_volume >= 10) // Filter no-volume
                        .filter((k: Keyword) => k.keyword.split(' ').length >= 2) // Filter generic single words
                        .map((k: Keyword) => ({
                            ...k,
                            competition_level: k.competition_level || (k.competition < 0.3 ? 'LOW' : k.competition < 0.7 ? 'MEDIUM' : 'HIGH')
                        }))
                        // Sort: Prioritize High Volume + Low Competition
                        // Simple score: Volume * (1 - Competition)
                        .sort((a: Keyword, b: Keyword) => {
                            const scoreA = a.search_volume * (1 - a.competition);
                            const scoreB = b.search_volume * (1 - b.competition);
                            return scoreB - scoreA;
                        })
                        .slice(0, 50); // Take top 50
                }
            } catch (dfsError) {
                console.error('DataForSEO analysis failed, falling back to Gemini:', dfsError);
                analyzedKeywords = []; // Ensure fallback triggers
            }
        }

        // 2. Fallback to Gemini if DataForSEO failed or returned no results
        if (!analyzedKeywords || analyzedKeywords.length === 0) {
            console.log('Generating keywords and metrics with Gemini (Fallback) for:', topic);
            try {
                analyzedKeywords = await gemini.generateKeywordsWithMetrics(topic, businessDescription);
            } catch (err: any) {
                console.error("Gemini Analysis Error:", err);
                throw new Error(`Gemini Analysis Failed: ${err.message}`);
            }
        }

        if (!analyzedKeywords || analyzedKeywords.length === 0) {
            throw new Error('Analysis returned no results (both DataForSEO and AI failed).');
        }

        const result: TopicAnalysisResult = {
            name: "TOPIC 1",
            description: `Analysis of "${topic}" (${analyzedKeywords.length} keywords found via ${dfsUser && dfsPass ? 'DataForSEO' : 'AI'})`,
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
                    app_id: appId
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
