export interface DataForSeoConfig {
    username: string;
    password: string;
    baseUrl: string;
}

export class DataForSeoService {
    private config: DataForSeoConfig;

    constructor(config: DataForSeoConfig) {
        this.config = config;
    }

    private get authHeader(): string {
        return `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`;
    }

    async getKeywordSuggestions(topic: string, locationCode: number = 2380): Promise<any> {
        const response = await fetch(`${this.config.baseUrl}/v3/keywords_data/google/keyword_ideas/live`, {
            method: 'POST',
            headers: {
                'Authorization': this.authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{
                keywords: [topic],
                location_code: locationCode,
                language_code: "it", // Defaulting to Italian based on user language
                include_seed_keyword: true,
                limit: 10
            }])
        });

        if (!response.ok) {
            throw new Error(`DataForSEO API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.tasks?.[0]?.result || [];
    }

    async getSearchVolume(keywords: string[], locationCode: number = 2380): Promise<any> {
        const response = await fetch(`${this.config.baseUrl}/v3/keywords_data/google/search_volume/live`, {
            method: 'POST',
            headers: {
                'Authorization': this.authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{
                keywords: keywords,
                location_code: locationCode,
                language_code: "it"
            }])
        });

        if (!response.ok) {
            throw new Error(`DataForSEO API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.tasks?.[0]?.result || [];
    }
}
