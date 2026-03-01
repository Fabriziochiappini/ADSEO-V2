import React from 'react';
import JsonLd from '@/components/JsonLd';
import MagazineHero from '@/components/MagazineHero';
import ArticleGrid from '@/components/ArticleGrid';
import ServiceSection from '@/components/ServiceSection';
import YouTubeVideo from '@/components/YouTubeVideo';
import Link from 'next/link';
import {
  SERVICES,
  getLiveArticles,
  DOMAIN,
  BRAND_NAME,
  BRAND_TAGLINE,
  SITE_TITLE,
  META_DESCRIPTION,
  SERVICES_TITLE,
  SERVICES_SUBTITLE,
  HERO_TITLE,
  HERO_SUBTITLE,
  YOUTUBE_VIDEO_ID
} from '@/lib/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: DOMAIN,
  },
  openGraph: {
    title: SITE_TITLE,
    description: META_DESCRIPTION,
    url: DOMAIN,
    siteName: BRAND_NAME,
    type: 'website',
    locale: 'it-IT',
  }
};

export default async function Home() {
  const articles = await getLiveArticles();

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": BRAND_NAME,
    "description": META_DESCRIPTION,
    "url": DOMAIN,
    "image": `${DOMAIN}/favicon.ico`,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IT"
    },
    "service": SERVICES.map(s => ({
      "@type": "Service",
      "name": s.title,
      "description": s.description
    }))
  };


  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-6 py-4">
      <JsonLd data={localBusinessSchema} />

      <header className="mb-12 mt-8">
        <h1 className="text-4xl md:text-7xl font-serif font-bold leading-[1.1] text-zinc-900 max-w-4xl">
          {HERO_TITLE}
        </h1>
        <p className="mt-6 text-zinc-500 text-lg md:text-xl max-w-2xl leading-relaxed">
          {HERO_SUBTITLE}
        </p>
      </header>

      <section className="mt-8">
        <MagazineHero article={articles[0]} />
      </section>

      <section id="articoli" className="mt-24">
        <div className="flex items-center justify-between mb-12 border-b border-zinc-100 pb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 italic">
            Magazine & Approfondimenti
          </h2>
          <div className="h-[1px] flex-grow mx-8 bg-zinc-100 hidden md:block"></div>
        </div>
        <ArticleGrid articles={articles.slice(1)} />
      </section>

      <section id="servizi">
        <ServiceSection
          title={SERVICES_TITLE}
          subtitle={SERVICES_SUBTITLE}
          services={SERVICES}
        />
      </section>

      {/* Video Section - Dynamic */}
      {YOUTUBE_VIDEO_ID && (
        <section className="mt-12">
          <YouTubeVideo videoId={YOUTUBE_VIDEO_ID} title={`Video Informativo per ${BRAND_NAME}`} />
        </section>
      )}

      {/* Link to Guide */}
      <div className="mt-20 text-center">
        <Link href="/guida" className="inline-flex items-center gap-2 text-zinc-900 font-bold border-b-2 border-zinc-900 pb-1 hover:text-brand-600 transition-colors uppercase tracking-widest text-xs">
          Esplora la nostra Guida Completa & Checklists →
        </Link>
      </div>
    </div>
  );
}
