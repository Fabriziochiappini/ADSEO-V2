import React from 'react';
import { BRAND_NAME, DOMAIN } from "@/lib/constants";
import Link from 'next/link';

export const metadata = {
    title: `Cookie Policy | ${BRAND_NAME}`,
    description: `Informativa estesa sui cookie di ${BRAND_NAME}. Scopri quali cookie utilizziamo e come gestirli o disabilitarli.`,
};

export default function CookiePolicy() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-24 md:py-40">
            <nav className="mb-12">
                <Link href="/" className="text-brand-600 font-bold flex items-center gap-2 hover:underline">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Torna alla Home
                </Link>
            </nav>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-12">Cookie Policy</h1>

            <div className="prose prose-zinc prose-lg max-w-none text-zinc-600 leading-relaxed space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">1. Cosa sono i cookie?</h2>
                    <p>
                        I cookie sono piccoli file di testo che i siti visitati dall'utente inviano al suo terminale, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla successiva visita del medesimo utente. In questo sito web <strong>{DOMAIN}</strong>, utilizziamo i cookie per migliorare la tua esperienza di navigazione.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">2. Cookie tecnici e di navigazione</h2>
                    <p>
                        Questi cookie sono necessari per il corretto funzionamento del sito. Includono, ad esempio, i cookie che consentono di accedere ad aree protette del sito o di gestire le preferenze dell'utente. Senza questi cookie, alcune parti del sito potrebbero non funzionare correttamente.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">3. Cookie di terze parti (Google Analytics)</h2>
                    <p>
                        Utilizziamo cookie di terze parti forniti da Google Analytics per raccogliere informazioni in forma anonima e aggregata sul traffico del sito. Questi dati vengono utilizzati esclusivamente per scopi statistici e per migliorare la qualità dei nostri contenuti.
                    </p>
                    <p>
                        Questi cookie possono raccogliere informazioni quali l'indirizzo IP, il tipo di browser, il dispositivo utilizzato e il comportamento dell'utente sul sito.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">4. Come disabilitare i cookie?</h2>
                    <p>
                        L'utente può gestire le preferenze relative ai cookie direttamente all'interno del proprio browser ed impedire — ad esempio — che terze parti possano installarne. Tramite le preferenze del browser è inoltre possibile eliminare i cookie installati in passato.
                    </p>
                    <p>
                        Puoi trovare informazioni su come gestire i cookie nei browser più diffusi ai seguenti indirizzi:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><a href="https://support.google.com/chrome/answer/95647?hl=it" target="_blank" className="text-brand-600 hover:underline">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" className="text-brand-600 hover:underline">Mozilla Firefox</a></li>
                        <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" className="text-brand-600 hover:underline">Apple Safari</a></li>
                        <li><a href="https://support.microsoft.com/it-it/help/4027947/microsoft-edge-delete-cookies" target="_blank" className="text-brand-600 hover:underline">Microsoft Edge</a></li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">5. Consenso</h2>
                    <p>
                        Continuando la navigazione su questo sito, acconsenti all'uso dei cookie come descritto in questa informativa semplificata. Ti ricordiamo che puoi sempre modificare le tue preferenze tramite le impostazioni del tuo browser.
                    </p>
                </section>

                <p className="text-sm text-zinc-400 mt-12 italic">
                    Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
        </div>
    );
}
