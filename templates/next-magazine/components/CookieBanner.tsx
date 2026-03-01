'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BRAND_NAME } from '@/lib/constants';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent-v2');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent-v2', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-6 rounded-3xl shadow-2xl shadow-black/50">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        <h3 className="text-white font-bold text-sm tracking-tight">Informativa sui Cookie</h3>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                        {BRAND_NAME} utilizza i cookie per migliorare la tua esperienza di navigazione e analizzare il traffico del sito.
                        Nessun dato personale viene venduto a terzi. Cliccando su "Accetta", acconsenti all'uso dei cookie.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                        <button
                            onClick={acceptCookies}
                            className="flex-1 bg-white text-zinc-950 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all active:scale-95"
                        >
                            Accetta
                        </button>
                        <Link
                            href="/cookie-policy"
                            className="text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            Leggi di più
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
