import React from 'react';
import {
    BRAND_NAME,
    SERVICES,
    SERVICES_HERO_TITLE,
    SERVICES_HERO_SUBTITLE,
    EXTENDED_SERVICES,
    WHY_CHOOSE_US_TITLE,
    WHY_CHOOSE_US_SUBTITLE,
    WHY_CHOOSE_US_POINTS,
    SERVICES_CTA_TITLE,
    SERVICES_CTA_SUBTITLE,
    SERVICES_CTA_TEXT,
    SERVICES_META_DESCRIPTION,
    SERVICES_FOOTER_QUOTE
} from "@/lib/constants";
import Link from 'next/link';

export const metadata = {
    title: `Servizi Professionali | ${BRAND_NAME}`,
    description: SERVICES_META_DESCRIPTION,
    alternates: { canonical: '/servizi' }
};

export default function ServicesPage() {
    const servicesList = EXTENDED_SERVICES.length > 0 ? EXTENDED_SERVICES : SERVICES;
    const pointsList = WHY_CHOOSE_US_POINTS.length > 0 ? WHY_CHOOSE_US_POINTS : [
        { title: "Standard Qualitativi Elevati", description: "Ogni nostra attività segue i massimi criteri di eccellenza del settore." },
        { title: "Esperienza Certificata", description: "Mettiamo a disposizione anni di competenza per risolvere ogni tua sfida." },
        { title: "Approccio Personalizzato", description: "Il cliente è al centro di ogni progetto, con soluzioni su misura e trasparenti." }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-32 md:py-48 bg-zinc-950 overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-900/10 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <span className="inline-block bg-brand-600/20 text-brand-400 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-8">
                        {BRAND_NAME} Excellence
                    </span>
                    <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight tracking-tight">
                        {SERVICES_HERO_TITLE}
                    </h1>
                    <p className="text-zinc-400 max-w-3xl mx-auto text-lg md:text-2xl font-light leading-relaxed mb-12">
                        {SERVICES_HERO_SUBTITLE}
                    </p>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                        <Link href="/#contatti" className="bg-white text-zinc-950 px-10 py-4 rounded-full font-bold text-lg hover:bg-brand-500 hover:text-white transition-all active:scale-95 shadow-xl">
                            {SERVICES_CTA_TEXT}
                        </Link>
                        <Link href="/" className="text-zinc-400 hover:text-white font-semibold transition-colors">
                            Torna alla Home
                        </Link>
                    </div>
                </div>
            </section>

            {/* Dettaglio Servizi */}
            <section className="py-24 bg-white relative z-20 -mt-10 rounded-t-[3rem]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {servicesList.map((service: any, idx: number) => (
                            <div key={idx} className="group p-10 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 hover:bg-white hover:border-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500">
                                <div className="w-16 h-16 bg-brand-600/10 text-brand-500 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 font-serif font-black text-xl">
                                    {service.icon?.length > 10 ? (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={service.icon} />
                                        </svg>
                                    ) : (
                                        <span>0{idx + 1}</span>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-900 mb-6">{service.title}</h2>
                                <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                                    {service.description}
                                </p>
                                <div className="pt-6 border-t border-zinc-100 flex items-center text-sm text-zinc-400 font-bold uppercase tracking-widest">
                                    <div className="w-2 h-2 rounded-full bg-brand-500 mr-3 animate-pulse" />
                                    Qualità Garantita
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sezione Metodo */}
            <section className="py-24 bg-zinc-50 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-8 leading-tight">
                                {WHY_CHOOSE_US_TITLE}
                            </h2>
                            <p className="text-zinc-500 text-xl leading-relaxed mb-10">
                                {WHY_CHOOSE_US_SUBTITLE}
                            </p>
                            <div className="space-y-6">
                                {pointsList.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold text-brand-600 shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-900 text-lg mb-1">{item.title}</h4>
                                            <p className="text-zinc-500">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="aspect-square bg-white rounded-[4rem] shadow-2xl p-12 flex flex-col justify-center border border-zinc-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32" />
                                <h3 className="text-4xl font-serif font-bold text-zinc-900 mb-6">{SERVICES_CTA_TITLE}</h3>
                                <p className="text-zinc-500 text-lg leading-relaxed mb-10">
                                    {SERVICES_CTA_SUBTITLE}
                                </p>
                                <Link href="/#contatti" className="bg-zinc-950 text-white px-8 py-4 rounded-full font-bold text-center hover:bg-brand-600 transition-all shadow-xl shadow-zinc-900/10">
                                    {SERVICES_CTA_TEXT}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Final Quote Section */}
            <section className="py-24 bg-white text-center border-t border-zinc-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="w-12 h-0.5 bg-brand-500 mx-auto mb-12 opacity-30" />
                    <p className="text-2xl md:text-3xl font-serif italic text-zinc-500 leading-relaxed font-light">
                        "{SERVICES_FOOTER_QUOTE}"
                    </p>
                </div>
            </section>
        </div>
    );
}
