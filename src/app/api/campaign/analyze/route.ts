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
        // We ask Gemini to generate the list directly since DataForSEO ideas endpoint was returning 0 results for specific long tails
        console.log('Generating long-tail keywords for:', topic);
        const generatedKeywords = await gemini.generateLongTailKeywords(topic, businessDescription);

        // Ensure we have keywords
        if (!generatedKeywords || generatedKeywords.length === 0) {
            throw new Error('AI failed to generate keywords.');
        }
        console.log('Gemini generated:', generatedKeywords.length, 'keywords');

        // 2. Fetch Volume Metrics from DataForSEO
        // We use search_volume endpoint which is more reliable for checking specific keys
        console.log('Fetching metrics from DataForSEO Search Volume...');
        const rawData = await dataForSeo.getSearchVolume(generatedKeywords);

        // 3. Process Round 1 Data
        let processedKeywords: Keyword[] = processRawData(rawData);

        // 4. Check if we need enrichment (Round 2)
        const validCount = processedKeywords.filter(k => k.search_volume > 0).length;
        console.log(`Round 1 Valid (Vol > 0): ${validCount}/${processedKeywords.length}`);

        if (validCount < 15) {
            console.log('Low volume results. Triggering Round 2 (Broadening)...');

            // Get keywords with 0 volume to broadenc
            const zeroVolumeKeywords = processedKeywords
                .filter(k => k.search_volume === 0)
                .map(k => k.keyword)
                .slice(0, 20); // Take top 20 failed ones

            if (zeroVolumeKeywords.length > 0) {
                const broaderKeywords = await gemini.generateBroadVariations(zeroVolumeKeywords);
                console.log(`Gemini generated ${broaderKeywords.length} broader variations.`);

                if (broaderKeywords.length > 0) {
                    const rawDataRound2 = await dataForSeo.getSearchVolume(broaderKeywords);
                    const processedRound2 = processRawData(rawDataRound2);

                    // Merge results
                    processedKeywords = [...processedKeywords, ...processedRound2];
                }
            }
        }

        // 5. Final Filter, Dedupe, and Sort
        // De-duplicate by keyword
        const seen = new Set();
        const uniqueKeywords = processedKeywords.filter(k => {
            const duplicate = seen.has(k.keyword);
            seen.add(k.keyword);
            return !duplicate;
        });

        const finalKeywords = uniqueKeywords.filter((k: Keyword) => {
            // Keep if Volume > 0 OR if it's long tail (4+ words) even with 0 vol
            return k.search_volume > 0 || (k.keyword.split(' ').length >= 4);
        });

        const sortedKeywords = finalKeywords.sort((a: Keyword, b: Keyword) => {
            // Prioritize Volume first now, as we want to ensure traffic
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

            // 1. Create Campaign
            const { data: campaign, error: campaignError } = await supabase
                .from('campaigns')
                .insert({
                    topic: topic,
                    description: description, // Original description
                    app_id: appId
                })
                .select()
                .single();

            if (campaignError) {
                console.error('Supabase Campaign Save Error:', campaignError);
            } else if (campaign) {
                // 2. Save Keywords
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
            // Don't block response even if DB fails
        }
        // -------------------------------------

        return NextResponse.json(result);
    } catch (error) {
        console.error('Analysis failed:', error);
        return NextResponse.json(
            { error: 'Failed to analyze campaign', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Helper to map DataForSEO response to Keyword interface
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
