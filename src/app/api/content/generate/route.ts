import { NextResponse } from 'next/server';
import { AiService } from '@/lib/api/gemini';

export async function POST(req: Request) {
    try {
        const { domain, keyword } = await req.json();

        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
        }

        const aiService = new AiService(geminiKey);
        const content = await aiService.generateLandingPageContent(domain, keyword);

        return NextResponse.json(content);
    } catch (error) {
        console.error('Content generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate site content' },
            { status: 500 }
        );
    }
}
