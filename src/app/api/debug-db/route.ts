import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    const { data: articles, error: e1 } = await supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(6);
    const { data: queue, error: e2 } = await supabase.from('article_queue').select('*').order('created_at', { ascending: false }).limit(6);
    return NextResponse.json({ articles, queue, e1, e2 });
}
