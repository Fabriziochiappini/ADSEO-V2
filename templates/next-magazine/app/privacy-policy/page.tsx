import React from 'react';
import { BRAND_NAME, DOMAIN } from "@/lib/constants";
import Link from 'next/link';

export const metadata = {
    title: `Privacy Policy | ${BRAND_NAME}`,
    description: `Informativa sulla privacy di ${BRAND_NAME}. Scopri come gestiamo e proteggiamo i tuoi dati personali in conformità al GDPR.`,
};

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-24 md:py-40">
            <nav className="mb-12">
                <Link href="/" className="text-brand-600 font-bold flex items-center gap-2 hover:underline">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Torna alla Home
                </Link>
            </nav>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-12">Privacy Policy</h1>

            <div className="prose prose-zinc prose-lg max-w-none text-zinc-600 leading-relaxed space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">1. Introduzione</h2>
                    <p>
                        Benvenuto su <strong>{BRAND_NAME}</strong>. La tua privacy è fondamentale per noi. Questa informativa spiega come raccogliamo, utilizziamo, proteggiamo e trattiamo i tuoi dati personali quando visiti il nostro sito web <strong>{DOMAIN}</strong>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">2. Titolare del Trattamento</h2>
                    <p>
                        Il titolare del trattamento dei dati è <strong>{BRAND_NAME}</strong>. Per qualsiasi domanda relativa alla privacy, puoi contattarci tramite la sezione contatti presente nel sito.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">3. Dati raccolti</h2>
                    <p>
                        Raccogliamo dati di navigazione anonimi per fini statistici e di miglioramento del servizio attraverso Google Analytics. I dati raccolti possono includere indirizzo IP, tipo di browser, pagine visitate e tempo di permanenza sul sito.
                    </p>
                    <p>
                        Non raccogliamo dati personali sensibili a meno che non vengano forniti volontariamente dall'utente tramite moduli di contatto o newsletter.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">4. Finalità del trattamento</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Garantire il corretto funzionamento del sito web.</li>
                        <li>Analizzare il traffico in modo aggregato (Google Analytics).</li>
                        <li>Rispondere a richieste di contatto inviate dall'utente.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">5. Google Analytics</h2>
                    <p>
                        Questo sito utilizza Google Analytics, un servizio di analisi web fornito da Google Ireland Limited. Le informazioni generate dai cookie sull'utilizzo del sito vengono trasmesse e depositate presso i server di Google. Google utilizza queste informazioni per tracciare ed esaminare l'utilizzo del sito web in forma anonima.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">6. I tuoi diritti (GDPR)</h2>
                    <p>
                        In conformità al Regolamento UE 2016/679 (GDPR), hai il diritto di accedere ai tuoi dati, chiederne la rettifica, la cancellazione o la limitazione del trattamento. Puoi inoltre opporti al trattamento dei tuoi dati personali in qualsiasi momento.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">7. Aggiornamenti</h2>
                    <p>
                        Ci riserviamo il diritto di modificare questa informativa in qualsiasi momento. La data di ultimo aggiornamento è indicata in calce alla pagina.
                    </p>
                </section>

                <p className="text-sm text-zinc-400 mt-12 italic">
                    Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
        </div>
    );
}
