import React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SITE_TITLE, META_DESCRIPTION, DOMAIN, BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ['400', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: META_DESCRIPTION,
  metadataBase: new URL(DOMAIN),
  openGraph: {
    images: [`${DOMAIN}/api/og`], // Fallback OG image
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  }
};

// Fetch GA ID dynamically from ADSEO — no redeploy needed when changed
async function getGaId(): Promise<string | null> {
  try {
    const adseoUrl = process.env.ADSEO_API_URL || 'https://adseo-v2.vercel.app';
    if (!adseoUrl) return null;
    const cleanDomain = DOMAIN.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const res = await fetch(`${adseoUrl}/api/ga-config?domain=${cleanDomain}`, {
      next: { revalidate: 300 } // Re-check every 5 minutes
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.ga_id || null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = await getGaId();
  const gaIdFinal = gaId || process.env.NEXT_PUBLIC_GA_ID || '';

  return (
    <html lang="it" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-zinc-900 min-h-screen flex flex-col`}>
        <GoogleAnalytics gaId={gaIdFinal} />
        {/* Navigation */}
        <Navbar brandName={BRAND_NAME} brandTagline={BRAND_TAGLINE} />

        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer id="contatti" className="bg-zinc-50 pt-32 pb-16 mt-32 border-t border-zinc-100 text-center">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold mb-8">{BRAND_NAME}<span className="text-zinc-500 italic">.{BRAND_TAGLINE.toLowerCase()}</span></h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-8 text-xs text-zinc-600 font-medium tracking-wide uppercase">
              <Link href="/privacy-policy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
              <span className="hidden md:inline opacity-20">•</span>
              <Link href="/cookie-policy" className="hover:text-brand-600 transition-colors">Cookie Policy</Link>
              <span className="hidden md:inline opacity-20">•</span>
              <Link href="/servizi" className="hover:text-brand-600 transition-colors">Servizi</Link>
              <span className="hidden md:inline opacity-20">•</span>
              <Link href="/chi-siamo" className="hover:text-brand-600 transition-colors">Chi Siamo</Link>
            </div>
            <p className="text-zinc-500 text-[10px]">&copy; {new Date().getFullYear()} {BRAND_NAME}. Informazione Libera e Trasparente. Tutti i diritti riservati.</p>
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}
