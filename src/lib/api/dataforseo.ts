export interface DataForSeoConfig {
    username: string;
    password: string;
}

export class DataForSeoService {
    private config: DataForSeoConfig;
    private baseUrl = 'https://api.dataforseo.com/v3';

    constructor(config: DataForSeoConfig) {
        this.config = config;
    }

    private get authHeader(): string {
        return `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`;
    }

    /**
     * Fetch keyword ideas using the strategies verified in debug-ideas.js
     * Defaults to the "Standard: Loc 2380 (Italy), Lang 'it'" payload which worked best.
     */
    async getKeywordIdeas(seeds: string[], locationCode: number = 2380, languageCode: string = 'it'): Promise<any> {
        // Using the "Standard" payload structure from debug-ideas.js
        const postData = [{
            keywords: seeds,
            location_code: locationCode,
            language_code: languageCode,
            include_seed_keyword: true,
            limit: 10 // Keeping it small as per debug script, or increase as needed for production? 
            // The debug script used 10, but initially we might want more. 
            // Let's stick to a reasonable default or the debug value. 
            // The original code had 100. Let's try 20 to start safe, or user can request more.
        }];

        try {
            const response = await fetch(`${this.baseUrl}/keywords_data/google/keyword_ideas/live`, {
                method: 'POST',
                headers: {
                    'Authorization': this.authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`DataForSEO API Policy Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            if (data.tasks?.[0]?.status_message !== 'Ok') {
                console.warn('DataForSEO Task Status:', data.tasks?.[0]?.status_message);
            }

            return data.tasks?.[0]?.result || [];

        } catch (error) {
            console.error('DataForSEO getKeywordIdeas failed:', error);
            throw error;
        }
    }

    /**
     * Fetch related keywords using the strategy verified in debug-related.js
     */
    async getRelatedKeywords(seed: string, locationCode: number = 2380, languageCode: string = 'it', depth: number = 1): Promise<any> {
        // Using the payload structure from debug-related.js
        const postData = [{
            keyword: seed,
            location_code: locationCode,
            language_code: languageCode,
            depth: depth,
            limit: 20 // Reasonable limit
        }];

        try {
            const response = await fetch(`${this.baseUrl}/keywords_data/google/related_keywords/live`, {
                method: 'POST',
                headers: {
                    'Authorization': this.authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`DataForSEO Related Keywords API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            if (data.tasks?.[0]?.status_message !== 'Ok') {
                console.warn('DataForSEO Task Status:', data.tasks?.[0]?.status_message);
            }

            // The result structure for related_keywords is tasks[0].result.items
            const result = data.tasks?.[0]?.result;
            return result?.items || null;

        } catch (error) {
            console.error('DataForSEO getRelatedKeywords failed:', error);
            throw error;
        }
    }
}

