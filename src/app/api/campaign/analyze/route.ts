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

        // 1. Generate Seed Keywords with Gemini
        // We ask Gemini to be specific to get better "long tail" starting points
        console.log('Generating seeds for:', topic);
        const seedKeywords = await gemini.generateSeedKeywords(topic, businessDescription);

        // Ensure we have seeds
        if (!seedKeywords || seedKeywords.length === 0) {
            throw new Error('AI failed to generate seed keywords.');
        }
        console.log('Seed keywords:', seedKeywords);

        // 2. Fetch Real Metrics from DataForSEO
        // We pass all seeds to get a broad set of related keywords (limit set to 100 in service)
        console.log('Fetching metrics from DataForSEO...');
        const rawData = await dataForSeo.getKeywordSuggestions(seedKeywords);

        // 3. Process and Filter Data
        const processedKeywords: Keyword[] = rawData.map((item: any) => ({
            keyword: item.keyword,
            search_volume: item.keyword_info?.search_volume || 0,
            competition: item.keyword_info?.competition_level || 0, // 0-1 float
            cpc: item.keyword_info?.cpc || 0,
            competition_level: item.keyword_info?.competition_level < 0.3 ? 'LOW' : item.keyword_info?.competition_level < 0.7 ? 'MEDIUM' : 'HIGH'
        })).filter((k: Keyword) => {
            // FILTER: Long Tail Logic
            // 1. Must have search volume > 0
            // 2. Must be "Long Tail" (at least 3 words)
            const wordCount = k.keyword.split(' ').length;
            return k.search_volume > 0 && wordCount >= 3;
        });

        // 4. Sort and Limit
        // Sort by Competition (Lower is better) THEN Volume (Higher is better)
        // Or a mixed score. User asked for "Low Competition" specifically.
        const sortedKeywords = processedKeywords.sort((a: Keyword, b: Keyword) => {
            if (a.competition !== b.competition) {
                return a.competition - b.competition; // ASC (Low first)
            }
            return b.search_volume - a.search_volume; // DESC (High vol second)
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
