import { NextRequest, NextResponse } from 'next/server';
import { DataForSeoService } from '@/lib/api/dataforseo';
import { AiService } from '@/lib/api/gemini';

export async function POST(req: NextRequest) {
    try {
        const { topic, businessDescription } = await req.json();

        if (!topic || !businessDescription) {
            return NextResponse.json({ error: 'Topic and business description are required' }, { status: 400 });
        }

        // Validate Environment Variables
        const geminiKey = process.env.GEMINI_API_KEY;
        const dfUsername = process.env.DATAFORSEO_USERNAME;
        const dfPassword = process.env.DATAFORSEO_PASSWORD;

        if (!geminiKey || !dfUsername || !dfPassword) {
            console.error('Missing configuration:', { geminiKey: !!geminiKey, dfUsername: !!dfUsername, dfPassword: !!dfPassword });
            return NextResponse.json({
                error: 'Server configuration error: Missing API credentials. Please ensure GEMINI_API_KEY, DATAFORSEO_USERNAME, and DATAFORSEO_PASSWORD are set in Vercel settings.'
            }, { status: 500 });
        }

        // Initialize Services
        const dataForSeo = new DataForSeoService({
            username: dfUsername,
            password: dfPassword,
            baseUrl: 'https://api.dataforseo.com'
        });

        const gemini = new AiService(geminiKey);

        // 1. Get Keywords from DataForSEO
        const keywordData = await dataForSeo.getKeywordSuggestions(topic);

        // 2. Analyze with Gemini
        const strategy = await gemini.analyzeTopic(topic, businessDescription, keywordData);

        return NextResponse.json(strategy);
    } catch (error: any) {
        console.error('Campaign analysis error:', error);
        return NextResponse.json({
            error: error.message || 'An unexpected error occurred during analysis.'
        }, { status: 500 });
    }
}
