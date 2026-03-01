import React from 'react';
import { BRAND_NAME, DOMAIN } from '@/lib/constants';

export const metadata = {
    title: `Privacy Policy | ${BRAND_NAME}`,
    description: `Informativa sulla privacy per gli utenti di ${BRAND_NAME}.`,
};

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20 prose prose-zinc prose-lg">
            <h1 className="text-4xl font-serif font-bold mb-8">Privacy Policy</h1>
            <p>Data di decorrenza: {new Date().toLocaleDateString('it-IT')}</p>

            <h2>1. Titolare del Trattamento</h2>
            <p>
                Il titolare del trattamento dei dati raccolti tramite questo sito web ({DOMAIN}) è <strong>{BRAND_NAME}</strong>.
                Essendo questo un sito a scopo puramente informativo o generato a scopo dimostrativo, non acquisiamo né elaboriamo
                dati personali per scopi commerciali se non espressamente autorizzati dall&apos;utente tramite moduli di contatto (qualora presenti).
            </p>

            <h2>2. Dati Raccolti</h2>
            <p>
                Durante l&apos;utilizzo di questo sito, potremmo raccogliere automaticamente alcune informazioni standard tramite servizi di statistica anonimizzata (come Google Analytics),
                che includono: indirizzi IP anonimizzati, tipo di browser, provider di servizi Internet (ISP), e pattern di navigazione.
            </p>

            <h2>3. Finalità del Trattamento</h2>
            <p>I dati raccolti vengono utilizzati esclusivamente per:</p>
            <ul>
                <li>Garantire il corretto funzionamento tecnico del sito.</li>
                <li>Analizzare il traffico in modo aggregato e anonimo per migliorare i nostri contenuti.</li>
                <li>Rispondere alle richieste degli utenti inviate volontariamente.</li>
            </ul>

            <h2>4. Cookie</h2>
            <p>
                Utilizziamo cookie tecnici essenziali e, previo consenso, cookie analitici di terze parti.
                Per maggiori dettagli, consulta la nostra <a href="/cookie-policy">Cookie Policy</a>.
            </p>

            <h2>5. Diritti dell&apos;Utente</h2>
            <p>
                Ai sensi del GDPR, hai il diritto di richiedere l&apos;accesso, la rettifica, la cancellazione dei tuoi dati o limitarne il trattamento.
                Per esercitare questi diritti, puoi contattarci facendo riferimento alle informazioni riportate nel form principale del sito.
            </p>
        </div>
    );
}
