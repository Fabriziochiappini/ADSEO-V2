import React from 'react';
import JsonLd from '@/components/JsonLd';
import MagazineHero from '@/components/MagazineHero';
import ArticleGrid from '@/components/ArticleGrid';
import ServiceSection from '@/components/ServiceSection';
import {
  HERO_TITLE,
  HERO_SUBTITLE,
  SERVICES,
  getLiveArticles,
  DOMAIN
} from '@/lib/constants';

export default async function Home() {
  const articles = await getLiveArticles();

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Sito Web Professionale Online",
    "description": "Leader nella consulenza e sviluppo web professionale con Next.js e SEO avanzata.",
    "url": DOMAIN,
    "telephone": "+39021234567",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via del Business 1",
      "addressLocality": "Milano",
      "postalCode": "20121",
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
            Ultimi Approfondimenti
          </h2>
          <div className="h-[1px] flex-grow mx-8 bg-zinc-100 hidden md:block"></div>
        </div>
        <ArticleGrid articles={articles.slice(1)} />
      </section>

      <section id="servizi">
        <ServiceSection services={SERVICES} />
      </section>
    </div>
  );
}
