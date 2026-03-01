import { MetadataRoute } from 'next'
import { getLiveArticles, DOMAIN } from '@/lib/constants'

// Opzionale: imposta la revalidate se vuoi che la sitemap si aggiorni in automatico 
// in base al tempo, ad esempio ogni ora (3600 secondi). 
// L'aggiunta di articoli farà aggiornare questa pagina.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const articles = await getLiveArticles();

    // Mappa gli articoli per la sitemap
    const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
        url: `${DOMAIN}/article/${article.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: `${DOMAIN}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...articleEntries,
    ]
}
