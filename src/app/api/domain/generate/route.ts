import { NextResponse } from 'next/server';
import { AiService } from '@/lib/api/gemini';

export async function POST(req: Request) {
    try {
        const { topic, keywords } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
        }

        const aiService = new AiService(geminiKey);
        const ideas = await aiService.generateDomainNames(topic, keywords || []);

        return NextResponse.json({
            domains: ideas
        });

    } catch (error) {
        console.error('Domain generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate domains' },
            { status: 500 }
        );
    }
}
