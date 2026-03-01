import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
    GUIDE_HERO_TITLE,
    GUIDE_HERO_SUBTITLE,
    GUIDES,
    GUIDE_CTA_TITLE,
    GUIDE_CTA_SUBTITLE,
    GUIDE_CTA_TEXT,
    BRAND_NAME
} from '@/lib/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: `Guida e Risorse | ${BRAND_NAME}`,
    description: GUIDE_HERO_SUBTITLE,
    alternates: { canonical: '/guida' }
};

export default function GuidePage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-6 py-12">
            <Breadcrumbs items={[{ label: 'Guida' }]} />

            <header className="mb-20 mt-12 text-center">
                <h1 className="text-4xl md:text-7xl font-serif font-bold leading-[1.1] text-zinc-900 max-w-4xl mx-auto">
                    {GUIDE_HERO_TITLE}
                </h1>
                <p className="mt-8 text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    {GUIDE_HERO_SUBTITLE}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
                {GUIDES.map((guide: any, idx: number) => {
                    // Ciclare tra diversi stili
                    const styles = [
                        "bg-white border-zinc-100 shadow-sm", // Standard
                        "bg-zinc-50 border-zinc-200 shadow-md", // Soft accent
                        "bg-white border-zinc-200 shadow-xl ring-1 ring-zinc-50" // Premium raised
                    ];
                    const currentStyle = styles[idx % styles.length];

                    return (
                        <div key={idx} className={`${currentStyle} p-10 rounded-[2.5rem] border hover:scale-[1.02] transition-all duration-500 group flex flex-col`}>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-serif font-black text-xl">
                                    0{idx + 1}
                                </div>
                                <div className="h-[1px] flex-grow bg-zinc-100 group-hover:bg-zinc-200 transition-colors"></div>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 mb-6 group-hover:text-zinc-500 transition-colors">
                                {guide.title}
                            </h3>

                            <p className="text-zinc-500 mb-8 leading-relaxed text-sm">
                                {guide.description}
                            </p>

                            {/* Varietà nella struttura dei contenuti: Liste vs Schemi */}
                            {idx % 2 === 0 ? (
                                <ul className="space-y-4 mb-8 flex-grow">
                                    {guide.steps.map((step: string, sIdx: number) => (
                                        <li key={sIdx} className="flex items-start gap-3 text-sm text-zinc-600 bg-white/50 p-3 rounded-xl border border-zinc-50 hover:bg-white transition-colors">
                                            <span className="text-zinc-900 font-black">→</span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="space-y-3 mb-8 flex-grow">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Schema Operativo</span>
                                    <div className="p-4 bg-white rounded-2xl border border-dashed border-zinc-200 space-y-3">
                                        {guide.steps.map((step: string, sIdx: number) => (
                                            <div key={sIdx} className="text-xs text-zinc-700 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
                                                {step}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-zinc-50 mt-auto">
                                <span className="text-[10px] font-black uppercase tracking-tight text-zinc-300">Curiosità & Tips</span>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Final CTA */}
            <section className="bg-zinc-900 rounded-[3rem] p-12 md:p-20 text-center text-white mt-12 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-zinc-900/10 to-transparent pointer-events-none"></div>
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8 relative z-10">{GUIDE_CTA_TITLE}</h2>
                <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 relative z-10 leading-relaxed">
                    {GUIDE_CTA_SUBTITLE}
                </p>
                <button className="bg-white text-zinc-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-zinc-900 hover:text-white transition-all shadow-lg hover:shadow-zinc-900/20 relative z-10">
                    {GUIDE_CTA_TEXT}
                </button>
            </section>
        </div>
    );
}
