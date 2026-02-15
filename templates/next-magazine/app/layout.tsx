import React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { BRAND_NAME, BRAND_TAGLINE, DOMAIN } from "@/lib/constants";
import Link from "next/link";

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
  title: `${BRAND_NAME} ${BRAND_TAGLINE}`,
  description: "Il punto di riferimento per l'eccellenza digitale e strategie SEO avanzate.",
  metadataBase: new URL(DOMAIN),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-zinc-900 min-h-screen flex flex-col`}>
        {/* Navigation */}
        <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-zinc-100 py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-serif font-bold tracking-tight hover:text-brand-600 transition-all active:scale-95"
            >
              {BRAND_NAME}<span className="text-brand-500 italic">{BRAND_TAGLINE}</span>
            </Link>

            <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-zinc-600">
              <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
              <Link href="/#articoli" className="hover:text-brand-600 transition-colors">Magazine</Link>
              <Link href="/#servizi" className="hover:text-brand-600 transition-colors">Servizi</Link>
              <button className="bg-zinc-900 text-white px-6 py-2.5 rounded-full hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-200 transition-all">Consulenza</button>
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-zinc-50 pt-32 pb-16 mt-32 border-t border-zinc-100 text-center">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold mb-8">{BRAND_NAME}<span className="text-brand-600 italic">.{BRAND_TAGLINE.toLowerCase()}</span></h2>
            <p className="text-zinc-400 text-sm">&copy; {new Date().getFullYear()} {BRAND_NAME} {BRAND_TAGLINE}. Crafted for Excellence.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
