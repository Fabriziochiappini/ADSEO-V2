export interface Keyword {
    keyword: string;
    search_volume: number;
    competition: number;
    cpc: number;
}

export interface SiteStrategy {
    id: string;
    domain: string;
    niche: string;
    angle: string;
    target_keywords: string[];
    content_topics: string[];
}

export interface NetworkStrategy {
    main_topic: string;
    business_description: string;
    sites: SiteStrategy[];
    overall_strategy: string;
}

export interface AiAnalysis {
    strategy: NetworkStrategy;
    recommendations: string[];
}
