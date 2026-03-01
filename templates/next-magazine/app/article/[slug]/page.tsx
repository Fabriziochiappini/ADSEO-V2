import React from 'react';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import YouTubeVideo from '@/components/YouTubeVideo';
import ArticleGrid from '@/components/ArticleGrid';
import { getLiveArticles, DOMAIN, BRAND_NAME, YOUTUBE_VIDEO_ID } from '@/lib/constants';
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';

interface ArticlePageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(
    { params }: ArticlePageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;
    const articles = await getLiveArticles();
    const article = articles.find((a) => a.slug === slug);

    if (!article) return {};

    const fullUrl = `${DOMAIN}/article/${slug}`;

    return {
        title: `${article.title} | ${BRAND_NAME}`,
        description: article.description,
        alternates: {
            canonical: fullUrl,
        },
        openGraph: {
            title: article.title,
            description: article.description,
            url: fullUrl,
            siteName: BRAND_NAME,
            images: [
                {
                    url: article.image,
                    width: 1200,
                    height: 630,
                    alt: article.title,
                },
            ],
            locale: 'it-IT',
            type: 'article',
            publishedTime: article.date,
            authors: [article.author],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.description,
            images: [article.image],
        },
    };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;
    const articles = await getLiveArticles();
    const article = articles.find((a) => a.slug === slug);

    if (!article) {
        notFound();
    }

    const otherArticles = articles.filter(a => a.slug !== slug);
    const randomRelated = otherArticles.length > 0 ? otherArticles[Math.floor(Math.random() * otherArticles.length)] : null;

    // Content Injection Logic: Inserimento "Scopri anche" a metà articolo
    const injectInternalLink = (html: string) => {
        if (!randomRelated) return html;
        const paragraphs = html.split('</p>');
        if (paragraphs.length < 3) return html;

        const middleIndex = Math.floor(paragraphs.length / 2);
        const internalLinkBox = `
            <div class="my-12 p-8 bg-zinc-50 border-l-4 border-zinc-900 rounded-r-2xl shadow-sm not-prose">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block">Approfondimento Consigliato</span>
                <p class="text-xl font-serif font-bold text-zinc-900 mb-4">Scopri anche: ${randomRelated.title}</p>
                <a href="/article/${randomRelated.slug}" class="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 border-b border-zinc-900 pb-0.5 hover:text-zinc-500 hover:border-zinc-500 transition-all">
                    Leggi l'articolo completo &rarr;
                </a>
            </div>
        `;

        paragraphs.splice(middleIndex, 0, internalLinkBox);
        return paragraphs.join('</p>');
    };

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "image": [article.image],
        "datePublished": article.date,
        "author": [{
            "@type": "Person",
            "name": article.author,
            "jobTitle": article.authorRole
        }],
        "publisher": {
            "@type": "Organization",
            "name": BRAND_NAME,
            "logo": {
                "@type": "ImageObject",
                "url": `${DOMAIN}/favicon.ico`
            }
        },
        "mainEntityOfPage": {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${DOMAIN}/article/${article.slug}`
        }
    };

    return (
        <article className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <JsonLd data={articleSchema} />

            <Breadcrumbs items={[{ label: 'Magazine', path: '/magazine' }, { label: article.title }]} />

            <header className="mt-10 mb-16">
                <div className="flex flex-wrap gap-2 mb-6">
                    {article.tags.map(tag => (
                        <span key={tag} className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {tag}
                        </span>
                    ))}
                </div>

                <h1 className="text-4xl md:text-6xl font-serif font-bold text-zinc-900 leading-[1.15] mb-8">
                    {article.title}
                </h1>

                <div className="flex items-center gap-6 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-white border-2 border-white shadow-sm">
                        {article.author.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-zinc-900">{article.author}</p>
                        <p className="text-sm text-zinc-500">{article.authorRole} • {article.date}</p>
                    </div>
                </div>
            </header>

            <div className="relative rounded-[2rem] overflow-hidden mb-16 shadow-2xl bg-zinc-100 ring-1 ring-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.image} alt={article.alt} className="w-full aspect-[16/9] object-cover" />
            </div>

            <div className="prose prose-zinc prose-lg max-w-none">
                <p className="text-2xl font-medium text-zinc-500 leading-relaxed italic border-l-4 border-zinc-200 pl-8 mb-12">
                    {article.excerpt}
                </p>
                <div
                    className="text-zinc-800 space-y-8 leading-loose text-lg article-content"
                    dangerouslySetInnerHTML={{ __html: injectInternalLink(article.content) }}
                />
            </div>

            {/* Articoli Correlati */}
            <section className="mt-24 pt-24 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-serif font-bold">Continua a leggere</h2>
                    <Link href="/magazine" className="text-zinc-400 hover:text-zinc-900 transition-colors font-semibold text-sm">
                        Vedi tutti &rarr;
                    </Link>
                </div>
                <ArticleGrid
                    articles={otherArticles.sort(() => 0.5 - Math.random()).slice(0, 3)}
                />
            </section>

            <footer className="mt-32 pb-16 text-center">
                <p className="text-zinc-400 italic text-sm max-w-2xl mx-auto">
                    La nostra missione è fornire informazioni trasparenti e di valore.
                    Ogni articolo è redatto con cura per garantire il massimo supporto alla nostra community e favorire scelte consapevoli.
                </p>
            </footer>
        </article>
    );
}
