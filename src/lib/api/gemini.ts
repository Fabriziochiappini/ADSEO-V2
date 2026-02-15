import { GoogleGenerativeAI } from "@google/generative-ai";
import { NetworkStrategy } from "@/types";

export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
  }

  async generateSubTopics(topic: string, businessDescription: string): Promise<{ sub_topics: string[] }> {
    const prompt = `Analyze the topic "${topic}" and business description "${businessDescription}".
    Identify 5-7 specific sub-topics, angles, or search contexts that are relevant for finding long-tail keywords (e.g., if topic is "moving", sub-topics could be "moving attics", "moving high floors", "moving north italy").
    
    Return a JSON object:
    {
      "sub_topics": string[]
    }`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }

  async analyzeTopic(topic: string, subTopics: string[], businessDescription: string, keywords: any[]): Promise<NetworkStrategy> {
    const prompt = `Analyze the following topic: "${topic}" and its sub-topics: ${JSON.stringify(subTopics)} for a business described as: "${businessDescription}". 
        Available keywords data (gathered for these sub-topics): ${JSON.stringify(keywords)}.
        
        Suggest a strategy for a multi-domain SEO network (3-5 sites). 
        Return a JSON object following the NetworkStrategy interface:
        {
          "main_topic": string,
          "business_description": string,
          "sub_topics": string[],
          "overall_strategy": string,
          "sites": [
            {
              "id": string,
              "domain": string,
              "niche": string,
              "angle": string,
              "target_keywords": string[],
              "content_topics": string[]
            }
          ]
        }`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  }

  async generateArticle(keyword: string, brief: string): Promise<string> {
    const prompt = `Write a high-quality, SEO-optimized article for the keyword: "${keyword}". 
        Brief: ${brief}. 
        Return the article in Markdown format with H1, H2, and H3 tags.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
  async generateLongTailKeywords(topic: string, businessDescription: string): Promise<string[]> {
    const prompt = `Analyze the business topic "${topic}" and description "${businessDescription}".
    Generate 40 specific, "long-tail" search phrases that potential customers would use.
    
    CRITICAL INSTRUCTIONS:
    1. Keywords MUST be in Italian.
    2. Focus on "Money Keywords" (high intent): "prezzi", "costo", "preventivo", "ditta", "migliori".
    3. Include location-specific variations if a location is mentioned in the description (e.g. "Torino", "Piemonte", "Roma").
    4. Include specific service variations (e.g. "sgombero cantine gratis", "pulizia solai", "traslochi piano alto").
    5. Length: Most keywords should be 3-6 words long.
    
    Return ONLY a JSON array of strings: ["keyword 1", "keyword 2", ...]`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  }

  async generateBroadVariations(keywords: string[]): Promise<string[]> {
    const prompt = `Here is a list of specific long-tail keywords that had 0 search volume:
    ${JSON.stringify(keywords)}
    
    Generate 20 broader, more common variations of these keywords that users actually search for.
    Keep the core intent (e.g. if "sgombero cantina gratis torino" has no volume, try "sgombero cantine torino" or "ditta sgomberi torino").
    
    Return ONLY a JSON array of strings: ["broad keyword 1", "broad keyword 2", ...]`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  }

  async generateKeywordsWithMetrics(topic: string, businessDescription: string): Promise<any[]> {
    const prompt = `Analyze the business topic "${topic}" and description "${businessDescription}".
    Generate a list of 30 high-intent, SEO-sensitive "long-tail" keywords in Italian.
    
    For EACH keyword, PROVIDE ESTIMATED METRICS based on your knowledge of the market:
    1. search_volume (monthly)
    2. competition (0.0 to 1.0)
    3. cpc (in USD)
    
    CRITICAL:
    - Keywords MUST be in Italian.
    - Metrics should be realistic (not all 0, not all same).
    - Competition level: <0.3 LOW, <0.7 MEDIUM, >0.7 HIGH.
    
    Return ONLY a JSON array of objects:
    [
      { "keyword": "...", "search_volume": 1200, "competition": 0.2, "cpc": 1.5 },
      ...
    ]`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const keywords = JSON.parse(text);

    return keywords.map((k: any) => ({
      ...k,
      competition_level: k.competition < 0.3 ? 'LOW' : k.competition < 0.7 ? 'MEDIUM' : 'HIGH'
    }));
  }

  async generateDomainNames(topic: string, keywords: string[]): Promise<string[]> {
    const prompt = `Generate 20 creative, SEO-friendly domain name ideas for the topic: "${topic}".
    Context keywords: ${keywords.slice(0, 5).join(', ')}.
    
    CRITICAL INSTRUCTIONS:
    1. Extensions: Mix of .com, .it, .net, .org, .online.
    2. Style: Short, memorable, brandable OR exact-match keywords.
    3. Language: Italian (since the topic is Italian).
    4. Format: Return ONLY the domain name (e.g. "sgomberorapido.it").
    
    Return ONLY a JSON array of strings: ["domain1.com", "domain2.it", ...]`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  }
}
