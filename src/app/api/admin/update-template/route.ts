import { NextResponse } from 'next/server';
import { github } from '@/lib/api/github';

const TEMPLATE_OWNER = 'Fabriziochiappini';
const TEMPLATE_REPO = 'lander-template';

// New layout.tsx content — stored here to avoid file system reads at runtime
const NEW_LAYOUT_CONTENT = [
    'import React from "react";',
    'import type { Metadata } from "next";',
    'import { Inter, Playfair_Display } from "next/font/google";',
    'import "./globals.css";',
    'import { BRAND_NAME, BRAND_TAGLINE, DOMAIN } from "@/lib/constants";',
    'import Link from "next/link";',
    'import Script from "next/script";',
    '',
    'const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });',
    'const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "700", "800"], display: "swap" });',
    '',
    'export const metadata: Metadata = {',
    '  title: `${BRAND_NAME} ${BRAND_TAGLINE}`,',
    '  description: "Il punto di riferimento per l\'eccellenza digitale e strategie SEO avanzate.",',
    '  metadataBase: new URL(DOMAIN),',
    '  alternates: { canonical: "/" },',
    '  robots: { index: true, follow: true }',
    '};',
    '',
    '// Fetch GA ID dynamically from ADSEO — no redeploy needed when changed',
    'async function getGaId(): Promise<string | null> {',
    '  try {',
    '    const adseoUrl = process.env.ADSEO_API_URL;',
    '    if (!adseoUrl) return null;',
    '    const cleanDomain = DOMAIN.replace(/^https?:\\/\\//, "").replace(/\\/$/, "");',
    '    const res = await fetch(`${adseoUrl}/api/ga-config?domain=${cleanDomain}`, {',
    '      next: { revalidate: 300 } // Re-check every 5 minutes',
    '    });',
    '    if (!res.ok) return null;',
    '    const data = await res.json();',
    '    return data.ga_id || null;',
    '  } catch {',
    '    return null;',
    '  }',
    '}',
    '',
    'export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {',
    '  const gaId = await getGaId();',
    '',
    '  return (',
    '    <html lang="it" className="scroll-smooth">',
    '      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-zinc-900 min-h-screen flex flex-col`}>',
    '        {/* Google Analytics — dynamic, no redeploy needed */}',
    '        {gaId && (',
    '          <>',
    '            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />',
    '            <Script id="google-analytics" strategy="afterInteractive">{`',
    '              window.dataLayer = window.dataLayer || [];',
    '              function gtag(){dataLayer.push(arguments);}',
    '              gtag("js", new Date());',
    '              gtag("config", "${gaId}");',
    '            `}</Script>',
    '          </>',
    '        )}',
    '',
    '        <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-zinc-100 py-4">',
    '          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">',
    '            <Link href="/" className="text-2xl font-serif font-bold tracking-tight hover:text-brand-600 transition-all active:scale-95">',
    '              {BRAND_NAME}<span className="text-brand-500 italic">{BRAND_TAGLINE}</span>',
    '            </Link>',
    '            <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-zinc-600">',
    '              <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>',
    '              <Link href="/#articoli" className="hover:text-brand-600 transition-colors">Magazine</Link>',
    '              <Link href="/#servizi" className="hover:text-brand-600 transition-colors">Servizi</Link>',
    '              <button className="bg-zinc-900 text-white px-6 py-2.5 rounded-full hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-200 transition-all">Consulenza</button>',
    '            </div>',
    '          </div>',
    '        </nav>',
    '',
    '        <main className="flex-grow">{children}</main>',
    '',
    '        <footer className="bg-zinc-50 pt-32 pb-16 mt-32 border-t border-zinc-100 text-center">',
    '          <div className="max-w-7xl mx-auto px-6">',
    '            <h2 className="text-3xl font-serif font-bold mb-8">{BRAND_NAME}<span className="text-brand-600 italic">.{BRAND_TAGLINE.toLowerCase()}</span></h2>',
    '            <p className="text-zinc-400 text-sm">&copy; {new Date().getFullYear()} {BRAND_NAME} {BRAND_TAGLINE}. Crafted for Excellence.</p>',
    '          </div>',
    '        </footer>',
    '      </body>',
    '    </html>',
    '  );',
    '}',
].join('\n');

/**
 * POST /api/admin/update-template
 * One-time action: commits the updated layout.tsx (with dynamic GA) to lander-template.
 * Requires GITHUB_TOKEN in environment variables.
 */
export async function POST() {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            return NextResponse.json(
                { error: 'GITHUB_TOKEN not set. Add it to your Vercel environment variables.' },
                { status: 500 }
            );
        }

        await github.commitFile(
            TEMPLATE_OWNER,
            TEMPLATE_REPO,
            'app/layout.tsx',
            NEW_LAYOUT_CONTENT,
            'feat: dynamic GA4 analytics via ADSEO API — no redeploy needed'
        );

        return NextResponse.json({
            success: true,
            message: 'lander-template updated successfully.',
            next_steps: [
                '1. Add ADSEO_API_URL env var to all existing lander sites on Vercel (e.g. https://your-adseo-app.vercel.app)',
                '2. Trigger a manual redeploy of each existing site ONCE to pick up the new layout.tsx',
                '3. From now on, changing GA ID in ADSEO dashboard requires no redeploy'
            ]
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
