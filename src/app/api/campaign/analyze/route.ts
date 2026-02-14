import { NextRequest, NextResponse } from 'next/server';
import { DataForSeoService } from '@/lib/api/dataforseo';
import { AiService } from '@/lib/api/gemini';

export async function POST(req: NextRequest) {
    try {
        const { topic, businessDescription } = await req.json();

        if (!topic || !businessDescription) {
            return NextResponse.json({ error: 'Topic and business description are required' }, { status: 400 });
        }

        // Initialize Services
        const dataForSeo = new DataForSeoService({
            username: process.env.DATAFORSEO_USERNAME || '',
            password: process.env.DATAFORSEO_PASSWORD || '',
            baseUrl: 'https://api.dataforseo.com'
        });

        const gemini = new AiService(process.env.GEMINI_API_KEY || '');

        // 1. Get Keywords from DataForSEO
        const keywordData = await dataForSeo.getKeywordSuggestions(topic);

        // 2. Analyze with Gemini
        const strategy = await gemini.analyzeTopic(topic, businessDescription, keywordData);

        return NextResponse.json(strategy);
    } catch (error: any) {
        console.error('Campaign analysis error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
