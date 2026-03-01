'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent-v2');
        if (!consent) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsVisible(true);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem('cookie-consent-v2', 'all');
        setIsVisible(false);
        // Dispatch event per dire a GA di inizializzarsi
        window.dispatchEvent(new Event('cookie-consent-granted'));
    };

    const acceptEssential = () => {
        localStorage.setItem('cookie-consent-v2', 'essential');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[999] bg-zinc-900 border-t border-zinc-800 text-zinc-300 p-4 md:p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-500 font-sans">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-sm leading-relaxed max-w-4xl">
                    <strong className="text-white block mb-1">Informativa sui Cookie</strong>
                    Utilizziamo cookie tecnici essenziali per il funzionamento del sito e, previo tuo consenso, cookie analitici (Google Analytics) per capire come viene utilizzato il nostro sito e migliorare l&apos;esperienza.
                    Puoi accettare tutti i cookie, solo quelli essenziali o leggere la nostra <Link href="/cookie-policy" className="text-white underline hover:text-brand-400 transition-colors">Cookie Policy completa</Link>.
                </div>
                <div className="flex w-full md:w-auto flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0">
                    <button onClick={acceptEssential} className="px-5 py-2.5 text-sm font-semibold border border-zinc-700 hover:bg-zinc-800 hover:text-white rounded-xl transition-all whitespace-nowrap">
                        Solo Essenziali
                    </button>
                    <button onClick={acceptAll} className="px-5 py-2.5 text-sm font-semibold bg-white text-zinc-900 hover:bg-brand-50 rounded-xl transition-all whitespace-nowrap shadow-sm">
                        Accetta Tutti
                    </button>
                </div>
            </div>
        </div>
    );
}
