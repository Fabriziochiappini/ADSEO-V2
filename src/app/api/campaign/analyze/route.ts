import { NextRequest, NextResponse } from 'next/server';
import { AiService } from '@/lib/api/gemini';
import { Keyword, TopicAnalysisResult } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const { topic, businessDescription } = await req.json();

        if (!topic || !businessDescription) {
            return NextResponse.json({ error: 'Topic and business description are required' }, { status: 400 });
        }

        const geminiKey = process.env.GEMINI_API_KEY;

        if (!geminiKey) {
            return NextResponse.json({
                error: 'Server configuration error: Missing GEMINI_API_KEY.'
            }, { status: 500 });
        }

        const gemini = new AiService(geminiKey);

        // 1. Generate Keywords & Estimated Metrics with Gemini only
        // User requested to stop using DataForSEO due to 500 errors/complexity
        console.log('Generating keywords and metrics with Gemini for:', topic);
        let analyzedKeywords: any[];
        try {
            analyzedKeywords = await gemini.generateKeywordsWithMetrics(topic, businessDescription);
        } catch (err: any) {
            console.error("Gemini Analysis Error:", err);
            throw new Error(`Gemini Analysis Failed: ${err.message}`);
        }

        if (!analyzedKeywords || analyzedKeywords.length === 0) {
            throw new Error('AI analysis returned no results.');
        }

        const result: TopicAnalysisResult = {
            name: "TOPIC 1",
            description: `AI-driven analysis of "${topic}"`,
            keywords: analyzedKeywords
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
                const keywordsToInsert = analyzedKeywords.map(k => ({
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
