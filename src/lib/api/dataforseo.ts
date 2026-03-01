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
     * Fetch keyword ideas using DataForSEO Labs (Live)
     * This provides real search volume, CPC, and competition data.
     */
    async getKeywordIdeas(seeds: string[], locationCode: number = 2380, languageCode: string = 'it'): Promise<any> {
        // DataForSEO Labs Keyword Suggestions takes a single "keyword" per task.
        // We will create a task for each seed (limit to first 3 to avoid excessive costs if many seeds provided)
        const tasks = seeds.slice(0, 6).map(seed => ({
            keyword: seed,
            location_code: locationCode,
            language_code: languageCode,
            include_seed_keyword: true,
            limit: 15 // 6 seeds × 15 results = 90 diverse real keywords
        }));

        try {
            // Using DataForSEO Labs API (Cheaper & Better for "Ideas")
            const response = await fetch(`${this.baseUrl}/dataforseo_labs/google/keyword_suggestions/live`, {
                method: 'POST',
                headers: {
                    'Authorization': this.authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tasks)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`DataForSEO API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            // Collect all items from all tasks
            let allItems: any[] = [];
            if (data.tasks) {
                data.tasks.forEach((task: any) => {
                    if (task.result && task.result[0] && task.result[0].items) {
                        allItems = [...allItems, ...task.result[0].items];
                    }
                });
            }

            // Map to our generic format
            return allItems.map(item => ({
                keyword: item.keyword,
                search_volume: item.keyword_info?.search_volume || 0,
                competition: item.keyword_info?.competition || 0,
                cpc: item.keyword_info?.cpc || 0,
                competition_level: item.keyword_info?.competition_level || 'UNKNOWN'
            }));

        } catch (error) {
            console.error('DataForSEO getKeywordIdeas failed:', error);
            throw error;
        }
    }

    /**
     * Fetch related keywords (Semantic)
     */
    async getRelatedKeywords(seed: string, locationCode: number = 2380, languageCode: string = 'it'): Promise<any> {
        const postData = [{
            keyword: seed,
            location_code: locationCode,
            language_code: languageCode,
            limit: 20
        }];

        try {
            const response = await fetch(`${this.baseUrl}/dataforseo_labs/google/related_keywords/live`, {
                method: 'POST',
                headers: {
                    'Authorization': this.authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`DataForSEO Related API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            const items = data.tasks?.[0]?.result?.[0]?.items || [];

            return items.map((item: any) => ({
                keyword: item.keyword,
                search_volume: item.keyword_data?.keyword_info?.search_volume || 0,
                competition: item.keyword_data?.keyword_info?.competition || 0,
                cpc: item.keyword_data?.keyword_info?.cpc || 0
            }));

        } catch (error) {
            console.error('DataForSEO getRelatedKeywords failed:', error);
            throw error;
        }
    }
}

