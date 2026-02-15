
import React, { useEffect } from 'react';
// Corrected import paths to use the lib directory instead of root files which are not modules
import { SEOConfig } from '@/lib/types';
import { DOMAIN } from '@/lib/constants';

const SEO: React.FC<SEOConfig> = ({ title, description, canonical, ogType = 'website', ogImage, articleData }) => {
  useEffect(() => {
    document.title = title;
    
    const updateOrCreateTag = (selector: string, attr: string, value: string, isProperty = false) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(isProperty ? 'property' : 'name', attr);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    updateOrCreateTag('meta[name="description"]', 'description', description);
    
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);

    // Open Graph
    updateOrCreateTag('meta[property="og:title"]', 'og:title', title, true);
    updateOrCreateTag('meta[property="og:description"]', 'og:description', description, true);
    updateOrCreateTag('meta[property="og:type"]', 'og:type', ogType, true);
    updateOrCreateTag('meta[property="og:url"]', 'og:url', canonical, true);
    if (ogImage) updateOrCreateTag('meta[property="og:image"]', 'og:image', ogImage, true);

  }, [title, description, canonical, ogType, ogImage]);

  return (
    <>
      {articleData && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": articleData.title,
            "image": [articleData.image],
            "datePublished": articleData.date,
            "author": [{
                "@type": "Person",
                "name": articleData.author,
                "jobTitle": articleData.authorRole
              }],
            "publisher": {
              "@type": "Organization",
              "name": "Sito Web Professionale Online",
              "logo": {
                "@type": "ImageObject",
                "url": `${DOMAIN}/logo.png`
              }
            },
            "description": articleData.description
          })}
        </script>
      )}
    </>
  );
};

export default SEO;
