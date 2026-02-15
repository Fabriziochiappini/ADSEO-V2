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

        // 3. Process and Filter Data
        const processedKeywords: Keyword[] = rawData.map((item: any) => {
            const vol = item.keyword_info?.search_volume || 0;
            // Handle null competition/cpc if missing
            const competition = item.keyword_info?.competition_level || 0;
            const cpc = item.keyword_info?.cpc || 0;

            return {
                keyword: item.keyword,
                search_volume: vol,
                competition: competition,
                cpc: cpc,
                competition_level: competition < 0.3 ? 'LOW' : competition < 0.7 ? 'MEDIUM' : 'HIGH'
            };
        }).filter((k: Keyword) => {
            // FILTER: 
            // 1. Keep keywords even with 0 volume if they look good?
            // User wants "posizionarsi", so ideally > 0.
            // But let's be less strict than before. If volume is null, maybe it is VERY long tail.
            // Let's filter only if word count is low, but Gemini already ensures long tail.
            // Let's keep items with volume > 0 OR if volume is 0 but it's a long phrase (4+ words).
            // Actually, let's stick to volume > 0 to ensure traffic potential, but minimal traffic is OK.
            // If DataForSEO returns null volume, it effectively means "no data".
            // Let's treat null as 0.

            return k.search_volume > 0 || (k.keyword.split(' ').length >= 4);
        });

        // 4. Sort
        // Primary: Traffic (Volume) DESC? Or Competition ASC?
        // User wants "Low Competition".
        const sortedKeywords = processedKeywords.sort((a: Keyword, b: Keyword) => {
            // If competition is available, sort by it (Low -> High)
            if (a.competition > 0 && b.competition > 0 && a.competition !== b.competition) {
                return a.competition - b.competition;
            }
            // Fallback to volume (High -> Low)
            return b.search_volume - a.search_volume;
        });

        const top30 = sortedKeywords.slice(0, 30);

        const result: TopicAnalysisResult = {
            name: "TOPIC 1",
            description: `Drafted from analysis of "${topic}"`,
            keywords: top30
        };

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json({
            error: error.message || 'An unexpected error occurred during analysis.'
        }, { status: 500 });
    }
}
