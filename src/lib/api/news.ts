import { XMLParser } from 'fast-xml-parser';

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    source: string;
}

export class NewsService {
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });
    }

    async getNewsForKeyword(keyword: string): Promise<NewsItem[]> {
        try {
            const encodedKeyword = encodeURIComponent(keyword);
            const url = `https://news.google.com/rss/search?q=${encodedKeyword}&hl=it&gl=IT&ceid=IT:it`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch news');

            const xmlData = await response.text();
            const jsonObj = this.parser.parse(xmlData);

            const items = jsonObj.rss?.channel?.item;

            if (!items) return [];

            // Se è un solo item, fast-xml-parser potrebbe non restituire un array
            const itemsArray = Array.isArray(items) ? items : [items];

            return itemsArray.slice(0, 3).map((item: any) => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                description: item.description || '',
                source: item.source?.['#text'] || 'Google News'
            }));
        } catch (error) {
            console.error('[NewsService] Error fetching news:', error);
            return [];
        }
    }

    formatNewsForAi(news: NewsItem[]): string {
        if (news.length === 0) return "Nessuna notizia recente trovata.";

        return news.map((n, i) =>
            `Notizia ${i + 1}: "${n.title}" (Fonte: ${n.source}, Data: ${n.pubDate})`
        ).join('\n');
    }
}
