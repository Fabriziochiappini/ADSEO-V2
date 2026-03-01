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

  private cleanAndParseJson(text: string): any {
    // Rimuovi blocchi markdown
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Trova l'inizio e la fine del JSON (oggetto o array)
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');

    let startIndex = -1;
    let endIndex = -1;

    // Determina se inizia prima con { o [
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIndex = firstBrace;
      endIndex = cleanText.lastIndexOf('}');
    } else if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIndex = firstBracket;
      endIndex = cleanText.lastIndexOf(']');
    }

    if (startIndex !== -1 && endIndex !== -1) {
      cleanText = cleanText.substring(startIndex, endIndex + 1);
    }

    try {
      return JSON.parse(cleanText);
    } catch (e) {
      console.error('JSON Parse Error. Raw text:', text, 'Cleaned text:', cleanText);
      throw new Error('Failed to parse AI response as JSON');
    }
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
    return this.cleanAndParseJson(response.text());
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
    return this.cleanAndParseJson(response.text());
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
    3. Include location-specific variations if a location is mentioned.
    4. NO SPECIFIC BRAND/COMPANY NAMES: DO NOT include names of existing local companies or competitors (e.g., if searching for mechanics, avoid 'Officina Rossi'). Focus only on the service and location.
    5. Length: Most keywords should be 3-6 words long.
    
    Return ONLY a JSON array of strings: ["keyword 1", "keyword 2", ...]`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.cleanAndParseJson(response.text());
  }

  async generateSeedKeywords(topic: string, businessDescription: string): Promise<string[]> {
    const prompt = `Analyze the business topic "${topic}" and description "${businessDescription}".
    Generate 5 distinct "Seed Keywords" to be used in a Keyword Research Tool (like DataForSEO or SEMrush).
    
    CRITICAL INSTRUCTIONS:
    1. Keywords MUST be in Italian.
    2. NO BRAND NAMES: Do not use names of existing companies. Use generic terms like "ditta", "servizio", "centro".
    3. These seeds should be broad enough to generate many suggestions, but specific enough to be relevant.
    4. Cover different angles:
       - Core service (e.g. "Sgombero")
       - Service + Location type (e.g. "Sgombero Cantine")
       - Problem/Solution (e.g. "Ritiro mobili usati")
       - Commercial intent (e.g. "Ditta sgomberi")
       - Niche variation (e.g. "Pulizia solai")
    
    Return ONLY a JSON array of strings: ["seed 1", "seed 2", ...]`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.cleanAndParseJson(response.text());
  }

  /**
   * ATQ EXPANSION — "Answer The Question" (Neil Patel Method)
   * Phase 2 of the dual-level pipeline.
   * Reads REAL keywords from DataForSEO (source of truth) + the user's
   * business description to generate EXACTLY 30 final long-tail keywords
   * for TOPIC 1. These 30 are the definitive pillar for the entire site.
   */
  async generateATQExpansion(
    realKeywords: { keyword: string; search_volume: number; competition: number }[],
    topic: string,
    businessDescription: string = ''
  ): Promise<any[]> {
    const topKeywords = realKeywords
      .sort((a, b) => b.search_volume - a.search_volume)
      .slice(0, 10)
      .map(k => `"${k.keyword}" (vol: ${k.search_volume})`);

    const prompt = `Sei un esperto SEO strategico. Il tuo compito è generare ESATTAMENTE 30 keyword long-tail finali per il TOPIC 1 di un sito web.

━━━ FONTE DI VERITÀ (DataForSEO - Keyword reali ricercate dal mercato) ━━━
${topKeywords.map((k, i) => `${i + 1}. ${k}`).join('\n')}

━━━ PROFILO ATTIVITÀ DELL'UTENTE ━━━
Topic: "${topic}"
Descrizione business: "${businessDescription}"

━━━ IL TUO COMPITO ━━━
Partendo dalle keyword REALI come ancora, genera ESATTAMENTE 30 keyword LONG-TAIL (4-8 parole) che:
1. Sono RADICATE nelle keyword reali sopra (non inventarne di nuove "a freddo")
2. Riflettono il PROFILO DELL'ATTIVITÀ (zona geografica, servizi specifici, target)
3. Coprono tutti gli INTENTI di ricerca:
   • INFORMAZIONALE: "come", "quando", "perché", "quanto tempo", "cosa serve"
   • COMMERCIALE: "quanto costa", "preventivo", "prezzi", "conviene"
   • TRANSAZIONALE: "affidabile", "urgente", "economico", "migliore ditta"
   • LOCALE: variazioni geografiche specifiche (zona, quartiere, provincia)
4. NO BRAND NAMES: zero nomi di aziende o competitor
5. ITALIANO: tutte in italiano
6. VARIETÀ: strutture diverse, non ripetitive

Restituisci SOLO un JSON array di ESATTAMENTE 30 oggetti:
[
  { "keyword": "...", "intent": "informational|commercial|transactional|local", "source_seed": "keyword reale di riferimento" },
  ...
]`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const expanded = this.cleanAndParseJson(response.text());

    return expanded.map((k: any) => ({
      keyword: k.keyword,
      search_volume: 0,      // Not verified by DataForSEO — long-tail estimated low
      competition: 0.15,     // Long-tail = naturally low competition
      cpc: 0,
      competition_level: 'LOW',
      source: 'Gemini ATQ',
      intent: k.intent || 'informational'
    }));
  }

  async generateBroadVariations(keywords: string[]): Promise<string[]> {
    const prompt = `Here is a list of specific long-tail keywords that had 0 search volume:
    ${JSON.stringify(keywords)}
    
    Generate 20 broader, more common variations of these keywords that users actually search for.
    Keep the core intent (e.g. if "sgombero cantina gratis torino" has no volume, try "sgombero cantine torino" or "ditta sgomberi torino").
    
    Return ONLY a JSON array of strings: ["broad keyword 1", "broad keyword 2", ...]`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.cleanAndParseJson(response.text());
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
    const keywords = this.cleanAndParseJson(response.text());

    return keywords.map((k: any) => ({
      ...k,
      competition_level: k.competition < 0.3 ? 'LOW' : k.competition < 0.7 ? 'MEDIUM' : 'HIGH'
    }));
  }

  async generateLandingPageContent(domain: string, keyword: string): Promise<any> {
    const prompt = `Create landing page content for the domain "${domain}" focused on the primary keyword "${keyword}".
    The target language is Italian.
    
    You must return a valid JSON object matching EXACTLY this structure, with no markdown formatting around it:
    {
      "brandName": "A SEO-aggressive brand name incorporating the keyword (string)",
      "brandTagline": "A short tagline (2 words max) (string)",
      "brandAuthorRole": "A niche-specific professional title for the author/redaction (e.g., 'Esperto di Fitness', 'Maestro di Ballo', 'Tecnico Sgomberi'). DO NOT use 'Esperto SEO' if the niche is different. (string)",
      "siteTitle": "A powerful SEO Title for <title> tag (MAX 60 chars) including the keyword (string)",
      "metaDescription": "A persuasive meta description (MAX 150 chars) for Google results (string)",
      "footerQuote": "A unique, inspiring editorial quote for the footer about this niche (string)",
      "heroTitle": "Powerful H1 including the keyword (MAX 60 chars) (string)",
      "heroSubtitle": "Engaging H2 explaining the value proposition (MAX 120 chars) (string)",
      "serviceDescription": "A 2-3 sentence description of the service using money keywords like 'prezzo', 'preventivo', 'migliori' (string).",
      "ctaText": "Short CTA like 'Richiedi Preventivo' (string)",
      "servicesTitle": "Catchy, high-impact H2 for the services section (e.g., I Nostri Servizi Esclusivi) (string)",
      "servicesSubtitle": "Sub-header for the services section, emphasizing quality and results (string)",
      "services": [
        { "title": "Service 1 Name", "description": "Short description" },
        { "title": "Service 2 Name", "description": "Short description" },
        { "title": "Service 3 Name", "description": "Short description" }
      ],
      "articlesTitle": "High-impact H2 for the blog section (string)",
      "youtubeVideoId": "A valid, high-quality YouTube Video ID for a general educational/commercial video attinent to the niche. Choose a popular and helpful video if possible. (string)"
    }
    
    CRITICAL: Ensure the keys match exactly. siteTitle and metaDescription are ESSENTIAL for SEO. Give a strong, high-impact connotation to everything.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const parsed = this.cleanAndParseJson(response.text());

      if (!parsed.brandName || !parsed.heroTitle) {
        console.error('[Gemini] Missing required fields. Parsed object:', parsed);
        throw new Error('AI response missing required fields (brandName or heroTitle)');
      }
      return parsed;
    } catch (error: any) {
      console.error('Gemini generateLandingPageContent Error:', error);
      throw new Error(`AI Generation failed: ${error.message}`);
    }
  }

  async generateGuidePageContent(domain: string, keyword: string): Promise<any> {
    const prompt = `Create content for the "Guides & Checklists" page of the domain "${domain}" focused on the primary keyword "${keyword}".
    The target language is Italian.
    
    You must return a valid JSON object matching EXACTLY this structure, with no markdown formatting around it:
    {
      "guideHeroTitle": "Catchy H1 for the guides section (MAX 60 chars) (string)",
      "guideHeroSubtitle": "Engaging H2 explaining what they will learn (MAX 120 chars) (string)",
      "guides": [
        {
          "title": "Guide/Checklist 1 Title (string)",
          "description": "Short explanation of this guide (string)",
          "steps": ["Step 1", "Step 2", "Step 3", "Step 4"]
        },
        {
          "title": "Guide/Checklist 2 Title (string)",
          "description": "Short explanation of this guide (string)",
          "steps": ["Step 1", "Step 2", "Step 3", "Step 4"]
        },
        {
          "title": "Guide/Checklist 3 Title (string)",
          "description": "Short explanation of this guide (string)",
          "steps": ["Step 1", "Step 2", "Step 3", "Step 4"]
        }
      ],
      "guideCtaTitle": "High-impact H2 for the final call to action (string)",
      "guideCtaSubtitle": "Persuasive subtitle to encourage contact (string)",
      "guideCtaText": "Short CTA text (e.g. Richiedi Consulenza) (string)"
    }
    
    CRITICAL: The array 'guides' must contain exactly 3 objects. Format exactly as requested.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.cleanAndParseJson(response.text());
    } catch (error: any) {
      console.error('Gemini generateGuidePageContent Error:', error);
      throw new Error(`AI Guide Generation failed: ${error.message}`);
    }
  }

  async generateServicesPageContent(domain: string, keyword: string, brandName: string): Promise<any> {
    const prompt = `Create HIGH-VALUE localized content for the "/servizi" (Services) page of "${brandName}" (domain: ${domain}), specialized in "${keyword}".
    The target language is Italian.
    
    You must return a valid JSON object matching EXACTLY this structure:
    {
      "servicesMetaDescription": "[PROMPT: Create a professional SEO meta description for this services page. DO NOT talk about SEO if the niche is ${keyword}]",
      "servicesHeroTitle": "[PROMPT: A catchy H1 for the services. Focus on quality and results in ${keyword}]",
      "servicesHeroSubtitle": "[PROMPT: An engaging H2. Explain how ${brandName} is a leader in ${keyword}. NO MENTIONS of Google/SEO/Ranking unless the topic is SEO]",
      "extendedServices": [
        {
          "title": "[PROMPT: Name of a specific service in the ${keyword} niche]",
          "description": "[PROMPT: Detailed description of this specific service (min 20 words)]",
          "icon": "One of the SVG paths"
        }
      ],
      "whyChooseUsTitle": "[PROMPT: H2 for the 'Our Method' section. Example: 'Il Metodo ${brandName} per l\\'Eccellenza' (string). NO MENTIONS of Google/SEO/Ranking if ${keyword} is NOT SEO]",
      "whyChooseUsSubtitle": "[PROMPT: Subtitle describing why this specific method for ${keyword} is superior. Use industry terms for ${keyword}]",
      "whyChooseUsPoints": [
        { "title": "[PROMPT: Positive quality 1 regarding service]", "description": "[PROMPT: Detail for point 1]" },
        { "title": "[PROMPT: Positive quality 2 regarding service]", "description": "[PROMPT: Detail for point 2]" },
        { "title": "[PROMPT: Positive quality 3 regarding service]", "description": "[PROMPT: Detail for point 3]" }
      ],
      "servicesCtaTitle": "[PROMPT: Final conversion title. Use calls to action specific to ${keyword}]",
      "servicesCtaSubtitle": "[PROMPT: Persuasive text to encourage the user to requested a quote/consultation for ${keyword}]",
      "servicesCtaText": "[PROMPT: Short button text (e.g. Inizia Ora, Prenota Ora)]",
      "servicesFooterQuote": "[PROMPT: A deep, professional phrase specific to ${keyword}]"
    }

    CRITICAL RULES:
    1. STRICT TOPIC ADHERENCE: If the topic is NOT SEO/Web Agency, DO NOT use words like "SEO", "Google", "Ranking", "Algoritmo", "Backlinks", "Performance Web".
    2. BRAND CONSISTENCY: Always refer to the company as "${brandName}".
    3. JSON VALIDITY: Return ONLY the raw JSON object. No markdown. No explanations.
    4. VARIETY: Ensure the 6 services in extendedServices are diverse and relevant to "${keyword}".`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.cleanAndParseJson(response.text());
    } catch (error: any) {
      console.error('Gemini generateServicesPageContent Error:', error);
      throw new Error(`AI Services Generation failed: ${error.message}`);
    }
  }

  async generateLongFormArticle(keyword: string, context: string = ''): Promise<any> {
    const angles = [
      "I falsi miti e gli errori da evitare",
      "Analisi dei costi e come risparmiare",
      "Consigli pratici e segreti degli esperti",
      "Tutto quello che c'è da sapere prima di iniziare",
      "Guida passo-passo ma fuori dagli schemi convenzionali",
      "Il parere della redazione e recensioni reali",
      "I trucchi del mestiere che nessuno ti dice"
    ];
    const randomAngle = angles[Math.floor(Math.random() * angles.length)];

    const prompt = `Write a professional, SEO-optimized article in Italian for the exact keyword: "${keyword}".
    Length: 1500-2000 words.
    
    CRITICAL CREATIVITY RULE:
    You MUST adopt this specific angle/tone for the article: "${randomAngle}".
    Produce a highly creative, unique Title (H1) and Excerpt. DO NOT use generic phrases like "Guida Completa per..." or "Tutto quello che devi sapere su...". Differentiate!
    
    HUMAN TOUCH & REAL-WORLD CONTEXT:
    ${context ? `Ecco alcune informazioni/notizie provenienti da diverse fonti reali (Wikipedia, News, Reddit ecc.) legate all'argomento:\n${context}\n\nISTRUZIONI CRITICA PER L'AMALGAMA ANTI-BOT E UTILITÀ:
    1. NON ESSERE UN BOT: Vietato limitarsi a riportare le fonti come un elenco o un riassunto enciclopedico.
    2. FILTRO BRAND: SE NEL CONTESTO APPAIONO NOMI DI AZIENDE SPECIFICHE O COMPETITOR (es. Rossi Sgomberi, ELMI, ecc.), DEVI ASSOLUTAMENTE IGNORARE IL NOME E PARLARE SOLO DEL SERVIZIO IN MODO GENERICO. Non fare pubblicità o menzioni a terzi.
    3. FUSIONE AUTOREVOLE: Devi usare Wikipedia per la precisione tecnica/storica, Google News per l'attualità territoriale e Reddit per capire i dubbi reali e i "pain points" degli utenti.
    4. FOCUS UTILITÀ: L'articolo deve essere PRIMA DI TUTTO UTILE all'utente. Risolvi problemi reali.
    5. NARRAZIONE FLUIDA: Usa le fonti naturalmente.
    6. E-E-A-T: Agisci come un esperto veterano che dà un consiglio pratico e autorevole.` : "Agisci come un esperto del settore che fornisce consigli pratici e utili, evitando toni enciclopedici o menzioni a brand specifici."}

    Structure:
    - Highly creative and catchy title (MAX 60 chars) (H1) incorporating the keyword naturally
    - Detailed excerpt (meta description style, MAX 150 chars) - make it unique!
    - Introduction focusing on the specific angle and the "human" context (Wikipedia/News amalgamation)
    - At least 5 sections with descriptive H2 titles. 
    - CRITICAL: NO <h1> tags inside the content. Start directly with H2.
    - Bullet points and lists where appropriate
    - ABSOLUTELY MANDATORY: You MUST include exactly 3 internal <a href="[DOMAIN_LINK_ID]/article/relevant-slug">anchor links</a> distributed inside the main text paragraphs. Replacing "relevant-slug" with a plausible keyword slug.
    - ABSOLUTELY MANDATORY: You MUST include at least 1 external link to an authoritative source (e.g. Wikipedia, Google, Gov sites) relevant to the niche. Use the URL provided in the context if applicable!
    - Conclusion with a soft CTA
    
    Avoid keyword stuffing. Target a high E-E-A-T score.
    
    Return ONLY a JSON object with:
    {
      "title": "Article Title",
      "slug": "url-friendly-slug",
      "excerpt": "Short summary for cards",
      "content": "Full HTML-formatted content. IMPORTANT: You MUST include the 3 mandatory anchors inside <p> tags.",
      "category": "One of: Strategia, Tecnologia, Design, Business",
      "tags": ["tag1", "tag2", "tag3"],
      "imageSearchTerm": "English term for a relevant Unsplash image"
    }`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.cleanAndParseJson(response.text());
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
    return this.cleanAndParseJson(response.text());
  }
}
