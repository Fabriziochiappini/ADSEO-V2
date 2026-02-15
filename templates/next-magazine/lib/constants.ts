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

export const DOMAIN = dynamic?.domain || 'https://sitowebprofessionale.online';
export const BRAND_NAME = dynamic?.brandName || 'SitoWeb';
export const BRAND_TAGLINE = dynamic?.brandTagline || 'Professionale';
export const HERO_TITLE = dynamic?.heroTitle || 'Crea la tua Eccellenza Digitale Professionale.';
export const HERO_SUBTITLE = dynamic?.heroSubtitle || 'Dal 2018 aiutiamo professionisti e aziende a scalare i motori di ricerca con siti web ultra-veloci e design orientato alla conversione.';
export const CAMPAIGN_ID = dynamic?.campaignId || null;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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

    return data.map((a: any) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      description: a.excerpt,
      content: a.content,
      category: a.category,
      author: 'Redazione',
      authorRole: 'Esperto SEO',
      date: new Date(a.published_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }),
      image: a.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
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
    author: 'ADSEO Team',
    authorRole: 'System',
    date: 'Oggi',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    alt: 'HUB Digitale',
    tags: ['Tech', 'SEO']
  }
];

export const SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Sviluppo Next.js Enterprise',
    description: 'Siti ultra-veloci con architettura App Router, ottimizzati per massime performance e scalabilità.',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
  },
  {
    id: 's2',
    title: 'SEO & Content Marketing',
    description: 'Strategie di posizionamento organico basate su dati e contenuti generati per convertire.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
  }
];
