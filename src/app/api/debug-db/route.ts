import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    const { data: articles } = await supabase.from('articles').select('campaign_id, title, keyword, created_at').order('created_at', { ascending: false }).limit(20);
    const { data: queue } = await supabase.from('article_queue').select('campaign_id, keyword, status, scheduled_at').order('created_at', { ascending: false }).limit(10);
    return NextResponse.json({ articles, queue });
}
