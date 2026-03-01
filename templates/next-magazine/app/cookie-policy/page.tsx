import React from 'react';
import { BRAND_NAME, DOMAIN } from '@/lib/constants';

export const metadata = {
    title: `Cookie Policy | ${BRAND_NAME}`,
    description: `Informativa sui cookie utilizzati da ${BRAND_NAME}.`,
};

export default function CookiePolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20 prose prose-zinc prose-lg">
            <h1 className="text-4xl font-serif font-bold mb-8">Cookie Policy</h1>
            <p>Data di decorrenza: {new Date().toLocaleDateString('it-IT')}</p>

            <h2>1. Cosa sono i cookie?</h2>
            <p>
                I cookie sono piccoli file di testo che i siti salvano sul tuo computer o dispositivo mobile durante la navigazione. Aiutano il sito a ricordare le tue preferenze e offrono informazioni utili per migliorare l&apos;esperienza utente.
            </p>

            <h2>2. Come utilizziamo i cookie</h2>
            <p>Il sito di <strong>{BRAND_NAME}</strong> ({DOMAIN}) utilizza le seguenti tipologie di cookie:</p>
            <ul>
                <li><strong>Cookie Tecnici Essenziali:</strong> Necessari per il corretto caricamento delle pagine e delle funzionalità di base (ad es. per mostrare questo banner). Questi cookie non richiedono il tuo consenso preventivo.</li>
                <li><strong>Cookie Analitici:</strong> Usiamo strumenti come Google Analytics per capire quante persone visitano il sito e quali pagine sono più lette, raccogliendo solo dati aggregati e anonimizzati (anonimizzazione IP attiva). Possono essere disattivati.</li>
            </ul>

            <h2>3. Gestione del consenso</h2>
            <p>
                Al primo accesso, ti abbiamo mostrato un banner per accettare o rifiutare l&apos;uso dei cookie analitici.
                Puoi sempre cambiare la tua scelta o cancellare i cookie usando le impostazioni del tuo browser web (Chrome, Firefox, Safari, Edge ecc.).
            </p>

            <h2>4. Cookie di Terze Parti</h2>
            <p>
                Il nostro sito potrebbe incorporare video da YouTube, mappe da Google Maps o pulsanti social, i quali rilasciano cookie secondo la policy delle rispettive piattaforme esterne:
            </p>
            <ul>
                <li>Google e YouTube: <a href="https://policies.google.com/privacy" rel="nofollow">policies.google.com/privacy</a></li>
            </ul>

            <h2>5. Contatti</h2>
            <p>Per ulteriori informazioni su come gestiamo i tuoi dati, fai riferimento alla nostra <a href="/privacy-policy">Privacy Policy</a> o contattaci tramite i canali ufficiali del sito.</p>
        </div>
    );
}
