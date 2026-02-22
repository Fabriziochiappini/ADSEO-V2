import { NextRequest, NextResponse } from 'next/server';
import { AiService } from '@/lib/api/gemini';
import { DataForSeoService } from '@/lib/api/dataforseo';
import { Keyword, TopicAnalysisResult } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const { topic, businessDescription } = await req.json();

        if (!topic || !businessDescription) {
            return NextResponse.json({ error: 'Topic and business description are required' }, { status: 400 });
        }

        const geminiKey = process.env.GEMINI_API_KEY;
        const dfsUser = process.env.DATAFORSEO_USERNAME;
        const dfsPass = process.env.DATAFORSEO_PASSWORD;

        if (!geminiKey) {
            return NextResponse.json({
                error: 'Server configuration error: Missing GEMINI_API_KEY.'
            }, { status: 500 });
        }

        const gemini = new AiService(geminiKey);
        let analyzedKeywords: any[] = [];

        // 1. Try DataForSEO First (Real Data)
        if (dfsUser && dfsPass) {
            console.log(`Attempting DataForSEO analysis for topic: ${topic}`);
            try {
                const dfs = new DataForSeoService({ username: dfsUser, password: dfsPass });
                // Use topic as the seed keyword
                analyzedKeywords = await dfs.getKeywordIdeas([topic]);
                
                if (analyzedKeywords && analyzedKeywords.length > 0) {
                    console.log(`DataForSEO returned ${analyzedKeywords.length} keywords.`);
                    // Ensure competition_level is set
                    analyzedKeywords = analyzedKeywords.map(k => ({
                        ...k,
                        competition_level: k.competition_level || (k.competition < 0.3 ? 'LOW' : k.competition < 0.7 ? 'MEDIUM' : 'HIGH')
                    }));
                }
            } catch (dfsError) {
                console.error('DataForSEO analysis failed, falling back to Gemini:', dfsError);
                analyzedKeywords = []; // Ensure fallback triggers
            }
        }

        // 2. Fallback to Gemini if DataForSEO failed or returned no results
        if (!analyzedKeywords || analyzedKeywords.length === 0) {
            console.log('Generating keywords and metrics with Gemini (Fallback) for:', topic);
            try {
                analyzedKeywords = await gemini.generateKeywordsWithMetrics(topic, businessDescription);
            } catch (err: any) {
                console.error("Gemini Analysis Error:", err);
                throw new Error(`Gemini Analysis Failed: ${err.message}`);
            }
        }

        if (!analyzedKeywords || analyzedKeywords.length === 0) {
            throw new Error('Analysis returned no results (both DataForSEO and AI failed).');
        }

        const result: TopicAnalysisResult = {
            name: "TOPIC 1",
            description: `Analysis of "${topic}" (${analyzedKeywords.length} keywords found via ${dfsUser && dfsPass ? 'DataForSEO' : 'AI'})`,
            keywords: analyzedKeywords
        };

        // --- Save to Supabase (Foundation) ---
        let campaignId: string | null = null;
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
                campaignId = campaign.id;
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

        return NextResponse.json({ ...result, campaignId });
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
