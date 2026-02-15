
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import MagazineHero from './components/MagazineHero';
import ArticleGrid from './components/ArticleGrid';
import ServiceSection from './components/ServiceSection';
import Breadcrumbs from './components/Breadcrumbs';
import JsonLd from './components/JsonLd';
import { ARTICLES, SERVICES, DOMAIN } from './lib/constants';
import { Article } from './lib/types';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'article'>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedArticle]);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Sito Web Professionale Online",
    "description": "Consulenza e sviluppo web professionale con Next.js e SEO avanzata.",
    "url": DOMAIN,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Milano",
      "addressCountry": "IT"
    }
  };

  const navigateToHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setCurrentView('home');
    setSelectedArticle(null);
  };

  const navigateToArticle = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('article');
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-100 selection:text-brand-900">
      <JsonLd data={localBusinessSchema} />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-zinc-100 py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button 
            onClick={navigateToHome}
            className="text-2xl font-serif font-black tracking-tighter hover:text-brand-600 transition-all flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
            </div>
            SitoWeb<span className="text-brand-600 italic">Pro</span>
          </button>
          
          <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <button onClick={navigateToHome} className="hover:text-brand-600 transition-colors">Home</button>
            <button onClick={() => { navigateToHome(); setTimeout(() => document.getElementById('articoli')?.scrollIntoView({behavior:'smooth'}), 100)}} className="hover:text-brand-600 transition-colors">Magazine</button>
            <button onClick={() => { navigateToHome(); setTimeout(() => document.getElementById('servizi')?.scrollIntoView({behavior:'smooth'}), 100)}} className="hover:text-brand-600 transition-colors">Servizi</button>
            <button className="bg-zinc-900 text-white px-8 py-3 rounded-full hover:bg-brand-600 transition-all shadow-xl hover:shadow-brand-200">Consulenza Gratis</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {currentView === 'home' ? (
          <div className="animate-in pt-16 pb-24">
            <header className="mb-20 text-center md:text-left">
              <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.95] text-zinc-900 max-w-5xl tracking-tighter">
                Il Futuro del <span className="text-brand-600 italic">Digitale</span> Professionale.
              </h1>
              <p className="mt-10 text-zinc-500 text-xl md:text-2xl max-w-3xl leading-relaxed font-light">
                Architetture Next.js ottimizzate per la velocità. Design minimale per la conversione. SEO per il dominio del mercato.
              </p>
            </header>

            <MagazineHero article={ARTICLES[0]} onSelect={navigateToArticle} />

            <section id="articoli" className="mt-32">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-8 mb-16">
                <h2 className="text-4xl font-serif font-bold text-zinc-900 italic">The Insight</h2>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400">←</div>
                    <div className="w-10 h-10 rounded-full border border-zinc-900 flex items-center justify-center text-zinc-900 font-bold">→</div>
                </div>
              </div>
              <ArticleGrid articles={ARTICLES.slice(1)} onSelect={navigateToArticle} />
            </section>

            <section id="servizi">
              <ServiceSection services={SERVICES} />
            </section>
          </div>
        ) : (
          <article className="max-w-4xl mx-auto py-16 animate-in">
            {selectedArticle && (
              <>
                <Breadcrumbs items={[{ label: 'Magazine' }, { label: selectedArticle.title }]} />
                
                <header className="mt-16 mb-20 text-center">
                  <div className="flex justify-center gap-3 mb-8">
                    {selectedArticle.tags.map(tag => (
                      <span key={tag} className="bg-zinc-100 text-zinc-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-5xl md:text-7xl font-serif font-bold text-zinc-900 leading-tight mb-12">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center justify-center gap-6 py-8 border-y border-zinc-100">
                    <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
                      {selectedArticle.author.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-zinc-900 text-lg">{selectedArticle.author}</p>
                      <p className="text-sm text-zinc-400 font-medium">{selectedArticle.authorRole} • {selectedArticle.date}</p>
                    </div>
                  </div>
                </header>

                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl mb-20 aspect-[16/9] bg-zinc-100 ring-1 ring-zinc-100">
                  <img src={selectedArticle.image} alt={selectedArticle.alt} className="w-full h-full object-cover" />
                </div>

                <div className="prose prose-zinc prose-2xl max-w-none text-zinc-800 leading-[1.8]">
                  <p className="text-3xl text-zinc-400 font-serif italic mb-16 pl-10 border-l-[6px] border-brand-500">
                    {selectedArticle.excerpt}
                  </p>
                  <div className="space-y-10">
                    {selectedArticle.content.split('. ').map((p, i) => (
                      <p key={i} className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-brand-600">
                        {p}.
                      </p>
                    ))}
                  </div>
                </div>

                <footer className="mt-32 pt-12 border-t border-zinc-100 flex justify-between items-center">
                  <button 
                    onClick={navigateToHome}
                    className="group flex items-center gap-4 text-zinc-400 hover:text-brand-600 font-black uppercase tracking-widest text-xs transition-all"
                  >
                    <span className="text-2xl group-hover:-translate-x-2 transition-transform duration-300">←</span> Back to insights
                  </button>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">f</div>
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">in</div>
                  </div>
                </footer>
              </>
            )}
          </article>
        )}
      </main>

      <footer className="bg-white border-t border-zinc-100 pt-32 pb-20 mt-32">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                <div className="col-span-2">
                    <p className="text-3xl font-serif font-black mb-8">SitoWeb<span className="text-brand-600 italic">Pro</span></p>
                    <p className="text-zinc-500 text-lg max-w-md font-light leading-relaxed">Eccellenza digitale dal 2018. Creiamo siti web che non sono solo belli, ma motori di crescita reale per il tuo business.</p>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-widest mb-6 text-zinc-400">Contatti</h4>
                    <p className="text-zinc-900 font-bold mb-2">info@sitowebpro.online</p>
                    <p className="text-zinc-500">Milano, Italia</p>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-widest mb-6 text-zinc-400">Seguici</h4>
                    <p className="text-zinc-900 font-bold mb-2">LinkedIn</p>
                    <p className="text-zinc-900 font-bold">Instagram</p>
                </div>
            </div>
            <div className="pt-10 border-t border-zinc-100 text-center flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-zinc-400 text-xs font-medium tracking-wide italic">Design & Engineering by WebPro Team</p>
                <p className="text-zinc-300 text-[10px] uppercase tracking-[0.3em]">© 2024 Sito Web Professionale Online.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
