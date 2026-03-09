import { Article, Service } from './types';
import { createClient } from '@supabase/supabase-js';

// Helper to get dynamic content from environment variables
const getDynamicContent = () => {
  if (typeof process === 'undefined' || !process.env.SITE_CONTENT) return null;
  try {
    return JSON.parse(process.env.SITE_CONTENT);
  } catch (e) {
    console.error("Failed to parse SITE_CONTENT", e);
    return null;
  }
};

const dynamic = getDynamicContent();

const rawDomain = dynamic?.domain || 'https://tuosito.it';
export const DOMAIN = rawDomain.startsWith('http') ? rawDomain : `https://${rawDomain}`;
export const BRAND_NAME = dynamic?.brandName || (rawDomain.replace(/^https?:\/\/(www\.)?/i, '').split('.')[0].charAt(0).toUpperCase() + rawDomain.replace(/^https?:\/\/(www\.)?/i, '').split('.')[0].slice(1).toLowerCase());
export const BRAND_TAGLINE = dynamic?.brandTagline || 'Servizi Professionali';
export const BRAND_AUTHOR_ROLE = dynamic?.brandAuthorRole || 'Redazione Specializzata';
export const HERO_TITLE = dynamic?.heroTitle || `Servizi Professionali di ${BRAND_NAME}`;
export const HERO_SUBTITLE = dynamic?.heroSubtitle || `Soluzioni di eccellenza progettate per massimizzare il tuo successo nel settore.`;
export const SERVICES_TITLE = dynamic?.servicesTitle || `${BRAND_NAME} | I Nostri Servizi`;
export const SERVICES_SUBTITLE = dynamic?.servicesSubtitle || 'Sviluppiamo soluzioni che combinano estetica superiore e prestazioni elevate.';
export const FOOTER_QUOTE = dynamic?.footerQuote || 'Mettiamo la qualità al centro di ogni nostro progetto.';
export const SITE_TITLE = dynamic?.siteTitle || `${BRAND_NAME} | ${BRAND_TAGLINE}`;
export const META_DESCRIPTION = dynamic?.metaDescription || `Scopri l'eccellenza di ${BRAND_NAME}. Servizi su misura per ogni esigenza.`;
export const CAMPAIGN_ID = dynamic?.campaignId || null;

// Services Page Content
export const SERVICES_META_DESCRIPTION = dynamic?.servicesMetaDescription || `Scopri i servizi di ${BRAND_NAME}. Consulenza su misura per il tuo successo.`;
export const SERVICES_HERO_TITLE = dynamic?.servicesHeroTitle || `I Nostri Servizi Professionali`;
export const SERVICES_HERO_SUBTITLE = dynamic?.servicesHeroSubtitle || `Esplora la nostra gamma completa di soluzioni progettate per i tuoi obiettivi.`;
export const EXTENDED_SERVICES = dynamic?.extendedServices || [];
export const WHY_CHOOSE_US_TITLE = dynamic?.whyChooseUsTitle || `Il Metodo ${BRAND_NAME} per l'Eccellenza`;
export const WHY_CHOOSE_US_SUBTITLE = dynamic?.whyChooseUsSubtitle || `Ci distinguiamo per la capacità di offrire risultati tangibili attraverso processi certificati.`;
export const WHY_CHOOSE_US_POINTS = dynamic?.whyChooseUsPoints || [];
export const SERVICES_CTA_TITLE = dynamic?.servicesCtaTitle || `Pronti per Nuove Opportunità?`;
export const SERVICES_CTA_SUBTITLE = dynamic?.servicesCtaSubtitle || `Contattaci oggi per una consulenza gratuita e personalizzata sui tuoi progetti.`;
export const SERVICES_CTA_TEXT = dynamic?.servicesCtaText || `Richiedi Consulenza`;
export const SERVICES_FOOTER_QUOTE = dynamic?.servicesFooterQuote || dynamic?.footerQuote || 'Ogni progetto è un\'opportunità per ridefinire gli standard.';

// Guide & Video Content
export const GUIDE_HERO_TITLE = dynamic?.guideHeroTitle || 'Guida alla Scelta Professionale';
export const GUIDE_HERO_SUBTITLE = dynamic?.guideHeroSubtitle || 'Suggerimenti pratici e checklist per massimizzare i tuoi risultati.';
export const GUIDES = dynamic?.guides || [];
export const GUIDE_CTA_TITLE = dynamic?.guideCtaTitle || 'Hai bisogno di supporto?';
export const GUIDE_CTA_SUBTITLE = dynamic?.guideCtaSubtitle || 'Contattaci oggi per una consulenza gratuita e personalizzata.';
export const GUIDE_CTA_TEXT = dynamic?.guideCtaText || 'Contattaci Ora';

// Premium placeholders pool for last-resort fallbacks
const FALLBACK_PREMIUM_URL = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

// About Us Page Content
export const ABOUT_TITLE = dynamic?.aboutTitle || `Chi Siamo | ${BRAND_NAME}`;
export const ABOUT_INTRO = dynamic?.aboutIntro || `<p>Siamo esperti nel settore di ${BRAND_TAGLINE}. La nostra missione è fornire soluzioni di alta qualità ai nostri clienti.</p>`;
export const ABOUT_TEAM = dynamic?.aboutTeam || `<p>Il nostro team è composto da professionisti con anni di esperienza, dedicati all'eccellenza e alla soddisfazione del cliente.</p>`;
export const ABOUT_CONCLUSION = dynamic?.aboutConclusion || `<p>Contattaci per saperne di più su come possiamo aiutarti a raggiungere i tuoi obiettivi con professionalità e trasparenza.</p>`;
export const ABOUT_META_DESCRIPTION = dynamic?.aboutExcerpt || `Scopri chi siamo e la nostra missione in ${BRAND_NAME}. Esperti al tuo servizio.`;
export const ABOUT_IMAGE_1 = getSafeImage(dynamic?.aboutImageUrl1, `${BRAND_NAME}-team-mission`);
export const ABOUT_IMAGE_2 = getSafeImage(dynamic?.aboutImageUrl2, `${BRAND_NAME}-presenza-territorio`);

function getSafeImage(url: string | null | undefined, seed: string): string {
  if (!url || url.includes('loremflickr.com') || url.includes('source.unsplash.com')) {
    const seoSlug = seed.toLowerCase().replace(/\s+/g, '-').substring(0, 30);
    return `${FALLBACK_PREMIUM_URL}&seo=${seoSlug}&sig=${seoSlug}`;
  }
  return url;
}

// Function to fetch articles from DB
export async function getLiveArticles(): Promise<Article[]> {
  if (!CAMPAIGN_ID) return ARTICLES;

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('campaign_id', CAMPAIGN_ID)
      .order('published_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return ARTICLES;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((a: any) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      description: a.excerpt,
      content: a.content,
      category: a.category,
      author: a.author || 'Redazione',
      authorRole: a.author_role || BRAND_AUTHOR_ROLE,
      date: new Date(a.published_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }),
      image: getSafeImage(a.image_url, a.slug || a.title),
      alt: a.title,
      tags: a.tags || []
    }));
  } catch (err) {
    console.error("Failed to fetch live articles", err);
    return ARTICLES;
  }
}

// Fallback Articles (Mock data)
export const ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'benvenuti',
    title: 'Benvenuti nel tuo nuovo HUB di contenuti SEO',
    excerpt: 'I tuoi articoli generati dall\'AI appariranno qui tra pochi minuti.',
    description: 'Pagina di benvenuto del nuovo network ADSEO.',
    content: '<p>Il sistema sta generando i tuoi 5 articoli pilastro. Una volta terminato, questa sezione verrà aggiornata automaticamente con contenuti ottimizzati e pronti per scalare Google.</p>',
    category: 'Update',
    author: 'Redazione',
    authorRole: BRAND_AUTHOR_ROLE,
    date: 'Oggi',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    alt: 'HUB Digitale',
    tags: ['Tech', 'SEO']
  }
];

export const SERVICES: Service[] = dynamic?.services || [
  {
    id: 's1',
    title: 'Servizio di Eccellenza',
    description: 'Soluzioni su misura progettate per massimizzare i risultati e garantire standard qualitativi superiori nel settore.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    id: 's2',
    title: 'Esperienza e Qualità',
    description: 'L\'affidabilità dei nostri processi ci permette di offrire un supporto concreto e professionale per ogni esigenza.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 's3',
    title: 'Innovazione Costante',
    description: 'Adottiamo le migliori strategie per assicurarci che ogni aspetto del progetto sia curato nei minimi dettagli.',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  }
];
