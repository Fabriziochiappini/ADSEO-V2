import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleGrid from '@/components/ArticleGrid';
import YouTubeVideo from '@/components/YouTubeVideo';
import { getLiveArticles, BRAND_NAME, YOUTUBE_VIDEO_ID } from '@/lib/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: `Magazine | Tutte le ultime notizie di ${BRAND_NAME}`,
    description: `Esplora il nostro magazine con approfondimenti, guide e novità dal settore.`,
    alternates: { canonical: '/magazine' }
};

export default async function MagazinePage() {
    const articles = await getLiveArticles();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-6 py-12">
            <Breadcrumbs items={[{ label: 'Magazine' }]} />

            <header className="mb-20 mt-12">
                <h1 className="text-4xl md:text-7xl font-serif font-bold leading-[1.1] text-zinc-900 max-w-4xl">
                    Il Nostro <span className="text-zinc-500 italic">Magazine</span>
                </h1>
                <p className="mt-8 text-zinc-500 text-lg md:text-xl max-w-2xl leading-relaxed">
                    Storie, approfondimenti e guide pratiche per aiutarti a navigare nel mercato moderno con consapevolezza e strategia.
                </p>
            </header>

            <section className="mt-12">
                <ArticleGrid articles={articles} />
            </section>

            {YOUTUBE_VIDEO_ID && (
                <div className="mt-24 border-t border-zinc-100 pt-24">
                    <YouTubeVideo videoId={YOUTUBE_VIDEO_ID} title={`Video Hub per ${BRAND_NAME}`} />
                </div>
            )}
        </div>
    );
}
