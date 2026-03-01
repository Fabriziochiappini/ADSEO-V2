import { NextResponse } from 'next/server';
import { AiService } from '@/lib/api/gemini';
import { prettifyDomainToBrand } from '@/lib/utils/branding-utils';

// Extend Vercel serverless function timeout (default is 10s on Hobby, this needs Pro for >10s)
export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { domain, keyword } = await req.json();
        console.log(`[Content Generate] Starting for domain=${domain}, keyword=${keyword}`);

        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            console.error('[Content Generate] GEMINI_API_KEY is not set!');
            return NextResponse.json({ error: 'Missing GEMINI_API_KEY in environment' }, { status: 500 });
        }

        const aiService = new AiService(geminiKey);

        const [landingContent, guideContent, servicesPageContent] = await Promise.all([
            aiService.generateLandingPageContent(domain, keyword),
            aiService.generateGuidePageContent(domain, keyword),
            aiService.generateServicesPageContent(domain, keyword)
        ]);

        const content = {
            ...landingContent,
            ...guideContent,
            ...servicesPageContent,
            // Force brandName from domain if missing or looks generic
            brandName: landingContent.brandName?.toLowerCase() === 'sitoweb' || !landingContent.brandName
                ? prettifyDomainToBrand(domain)
                : landingContent.brandName
        };

        console.log(`[Content Generate] Success for ${domain}:`, Object.keys(content));
        return NextResponse.json(content);
    } catch (error: any) {
        console.error('[Content Generate] FAILED:', error?.message || error);
        return NextResponse.json(
            { error: error?.message || 'Failed to generate site content' },
            { status: 500 }
        );
    }
}
