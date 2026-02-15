import { NextRequest, NextResponse } from 'next/server';
import { DataForSeoService } from '@/lib/api/dataforseo';
import { AiService } from '@/lib/api/gemini';
import { Keyword, TopicAnalysisResult } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const { topic, businessDescription } = await req.json();

        if (!topic || !businessDescription) {
            return NextResponse.json({ error: 'Topic and business description are required' }, { status: 400 });
        }

        const geminiKey = process.env.GEMINI_API_KEY;
        const dfUsername = process.env.DATAFORSEO_USERNAME;
        const dfPassword = process.env.DATAFORSEO_PASSWORD;

        if (!geminiKey || !dfUsername || !dfPassword) {
            return NextResponse.json({
                error: 'Server configuration error: Missing API credentials.'
            }, { status: 500 });
        }

        const dataForSeo = new DataForSeoService({
            username: dfUsername,
            password: dfPassword,
            baseUrl: 'https://api.dataforseo.com'
        });

        const gemini = new AiService(geminiKey);

        // 1. Generate Specific Keywords with Gemini
        console.log('Generating long-tail keywords for:', topic);
        let generatedKeywords;
        try {
            generatedKeywords = await gemini.generateLongTailKeywords(topic, businessDescription);
        } catch (err: any) {
            console.error("Gemini Generation Error:", err);
            throw new Error(`Gemini API Failed: ${err.message}`);
        }

        // Ensure we have keywords
        if (!generatedKeywords || generatedKeywords.length === 0) {
            throw new Error('AI failed to generate keywords (Empty response).');
        }
        console.log('Gemini generated:', generatedKeywords.length, 'keywords');

        // 2. Fetch Volume Metrics from DataForSEO
        console.log('Fetching metrics from DataForSEO Search Volume...');
        let rawData;
        try {
            rawData = await dataForSeo.getSearchVolume(generatedKeywords);
        } catch (err: any) {
            console.error("DataForSEO Error:", err);
            throw new Error(`DataForSEO Failed: ${err.message}`);
        }

        // 3. Process Round 1 Data
        let processedKeywords: Keyword[] = processRawData(rawData);

        // 4. Check if we need enrichment (Round 2)
        const validCount = processedKeywords.filter(k => k.search_volume > 0).length;
        console.log(`Round 1 Valid (Vol > 0): ${validCount}/${processedKeywords.length}`);

        if (validCount < 15) {
            console.log('Low volume results. Triggering Round 2 (Broadening)...');

            // Get keywords with 0 volume to broaden
            const zeroVolumeKeywords = processedKeywords
                .filter(k => k.search_volume === 0)
                .map(k => k.keyword)
                .slice(0, 20); // Take top 20 failed ones

            if (zeroVolumeKeywords.length > 0) {
                try {
                    const broaderKeywords = await gemini.generateBroadVariations(zeroVolumeKeywords);
                    console.log(`Gemini generated ${broaderKeywords.length} broader variations.`);

                    if (broaderKeywords.length > 0) {
                        const rawDataRound2 = await dataForSeo.getSearchVolume(broaderKeywords);
                        const processedRound2 = processRawData(rawDataRound2);

                        // Merge results
                        processedKeywords = [...processedKeywords, ...processedRound2];
                    }
                } catch (r2Err) {
                    console.error("Round 2 Enrichment Failed (Skipping):", r2Err);
                }
            }
        }

        // 5. Final Filter, Dedupe, and Sort
        const seen = new Set();
        const uniqueKeywords = processedKeywords.filter(k => {
            const duplicate = seen.has(k.keyword);
            seen.add(k.keyword);
            return !duplicate;
        });

        const finalKeywords = uniqueKeywords.filter((k: Keyword) => {
            return k.search_volume > 0 || (k.keyword.split(' ').length >= 4);
        });

        const sortedKeywords = finalKeywords.sort((a: Keyword, b: Keyword) => {
            if (b.search_volume !== a.search_volume) {
                return b.search_volume - a.search_volume;
            }
            return a.competition - b.competition;
        });

        const top30 = sortedKeywords.slice(0, 30);

        const result: TopicAnalysisResult = {
            name: "TOPIC 1",
            description: `Broadened analysis of "${topic}"`,
            keywords: top30
        };

        // --- Save to Supabase (Foundation) ---
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
                const keywordsToInsert = top30.map(k => ({
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
                } else {
                    console.log(`Saved campaign ${campaign.id} and ${keywordsToInsert.length} keywords to DB.`);
                }
            }
        } catch (dbErr) {
            console.error('Database operation failed:', dbErr);
        }

        return NextResponse.json(result);
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

function processRawData(rawData: any[]): Keyword[] {
    return rawData.map((item: any) => {
        const vol = item.keyword_info?.search_volume || 0;
        const competition = item.keyword_info?.competition_level || 0;
        const cpc = item.keyword_info?.cpc || 0;

        return {
            keyword: item.keyword,
            search_volume: vol,
            competition: competition,
            cpc: cpc,
            competition_level: competition < 0.3 ? 'LOW' : competition < 0.7 ? 'MEDIUM' : 'HIGH'
        };
    });
}
