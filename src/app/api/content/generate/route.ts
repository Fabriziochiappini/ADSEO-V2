import { NextResponse } from 'next/server';
import { AiService } from '@/lib/api/gemini';
import { ImageService } from '@/lib/api/images';
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
        const imageService = new ImageService(geminiKey);
        const derivedBrand = prettifyDomainToBrand(domain);

        const [landingContent, guideContent] = await Promise.all([
            aiService.generateLandingPageContent(domain, keyword),
            aiService.generateGuidePageContent(domain, keyword)
        ]);

        const finalBrand = landingContent.brandName?.toLowerCase() === 'sitoweb' || !landingContent.brandName
            ? derivedBrand
            : landingContent.brandName;

        const [servicesPageContent, aboutPageContent] = await Promise.all([
            aiService.generateServicesPageContent(domain, keyword, finalBrand),
            aiService.generateAboutPageContent(domain, keyword, finalBrand)
        ]);

        // Generate optimized images for Chi Siamo using the "optimized system"
        const domainSlug = domain.replace(/\./g, '-');
        const [aboutImage1, aboutImage2] = await Promise.all([
            imageService.processAndUploadImage(
                `${keyword} ${aboutPageContent.imageSearchTerm1 || 'team workspace'}`,
                `${domainSlug}-chi-siamo-team`,
                `${finalBrand} - Il nostro Team di Esperti`
            ),
            imageService.processAndUploadImage(
                `${keyword} ${aboutPageContent.imageSearchTerm2 || 'local office facade'}`,
                `${domainSlug}-chi-siamo-sede`,
                `${finalBrand} - Presenza sul Territorio`
            )
        ]);

        const content = {
            ...landingContent,
            ...guideContent,
            ...servicesPageContent,
            ...aboutPageContent,
            aboutImageUrl1: aboutImage1.url,
            aboutImageUrl2: aboutImage2.url,
            brandName: finalBrand
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
