import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    const { data: articles, error: e1 } = await supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(6);
    const { data: queue, error: e2 } = await supabase.from('article_queue').select('*').order('created_at', { ascending: false }).limit(6);
    return NextResponse.json({ articles, queue, e1, e2 });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, article, articles } = body;

        if (action === 'insert_queue_single') {
            const { error } = await supabase.from('article_queue').insert(article);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }
        
        if (action === 'insert_queue') {
             const { error } = await supabase.from('article_queue').insert(articles);
             if (error) throw error;
             return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}