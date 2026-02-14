import { GoogleGenerativeAI } from "@google/generative-ai";
import { NetworkStrategy } from "@/types";

export class AiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
    }

    async analyzeTopic(topic: string, businessDescription: string, keywords: any[]): Promise<NetworkStrategy> {
        const prompt = `Analyze the following topic: "${topic}" for a business described as: "${businessDescription}". 
        Available keywords data: ${JSON.stringify(keywords)}.
        
        Suggest a strategy for a multi-domain SEO network (3-5 sites). 
        Return a JSON object following the NetworkStrategy interface:
        {
          "main_topic": string,
          "business_description": string,
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
}
