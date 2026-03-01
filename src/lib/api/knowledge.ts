
import { XMLParser } from 'fast-xml-parser';

export interface ContextSource {
    type: 'wikipedia' | 'news' | 'youtube' | 'reddit';
    title: string;
    summary: string;
    link: string;
}

export class KnowledgeService {
    private xmlParser: XMLParser;

    constructor() {
        this.xmlParser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });
    }

    async getWikipediaContext(keyword: string): Promise<ContextSource[]> {
        try {
            const query = encodeURIComponent(keyword);
            // Search for pages
            const searchUrl = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (!searchData.query?.search?.length) return [];

            const firstResult = searchData.query.search[0];
            const pageTitle = encodeURIComponent(firstResult.title);

            // Get extract for the first page
            const extractUrl = `https://it.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${pageTitle}&format=json&origin=*`;
            const extractRes = await fetch(extractUrl);
            const extractData = await extractRes.json();

            const pages = extractData.query?.pages;
            const pageId = Object.keys(pages || {})[0];
            const extract = pages?.[pageId]?.extract;

            if (!extract) return [];

            return [{
                type: 'wikipedia',
                title: firstResult.title,
                summary: extract.substring(0, 500) + '...',
                link: `https://it.wikipedia.org/it/wiki/${pageTitle}`
            }];
        } catch (e) {
            console.error('[WikipediaService] Error:', e);
            return [];
        }
    }

    async getNewsContext(keyword: string): Promise<ContextSource[]> {
        try {
            const encodedKeyword = encodeURIComponent(keyword);
            const url = `https://news.google.com/rss/search?q=${encodedKeyword}&hl=it&gl=IT&ceid=IT:it`;
            const response = await fetch(url);
            const xmlData = await response.text();
            const jsonObj = this.xmlParser.parse(xmlData);
            const items = jsonObj.rss?.channel?.item;
            const itemsArray = Array.isArray(items) ? items : items ? [items] : [];

            return itemsArray.slice(0, 2).map((item: any) => ({
                type: 'news',
                title: item.title,
                summary: item.description || '',
                link: item.link
            }));
        } catch (e) {
            return [];
        }
    }

    async fetchAllContext(keyword: string): Promise<ContextSource[]> {
        console.log(`[KnowledgeEngine] Launching data probes for: ${keyword}...`);

        const [wiki, news] = await Promise.all([
            this.getWikipediaContext(keyword),
            this.getNewsContext(keyword)
        ]);

        const all = [...wiki, ...news];
        console.log(`[KnowledgeEngine] Captured ${all.length} context shards.`);
        return all;
    }

    formatContextForAi(sources: ContextSource[]): string {
        if (sources.length === 0) return "Nessuna fonte esterna trovata.";

        return sources.map((s, i) =>
            `----- [FONTE ${i + 1}: ${s.type.toUpperCase()}] -----\nTITOLO: ${s.title}\nCONTENUTO: ${s.summary}\nURL: ${s.link}`
        ).join('\n\n');
    }
}
