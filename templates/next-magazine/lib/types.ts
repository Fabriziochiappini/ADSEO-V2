
// Article interface for magazine posts
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  content: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  image: string;
  alt: string;
  tags: string[];
}

// Service interface for professional offerings
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Added SEOConfig interface to fix import error in components/SEO.tsx
export interface SEOConfig {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
  articleData?: {
    title: string;
    image: string;
    date: string;
    author: string;
    authorRole: string;
    description: string;
  };
}
