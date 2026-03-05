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

  /**
   * PHASE 0 — AI Topic Orchestrator
   * Explodes the main topic into 6 SEMANTICALLY DIVERSE angles for DataForSEO research.
   * Each angle must be intentionally DIFFERENT to maximize the diversity of DFS results.
   * This prevents DFS from returning variations of the same keyword.
   */
  async generateTopicAngles(topic: string, businessDescription: string): Promise<string[]> {
    const prompt = `Sei un Orchestratore SEO esperto. Il tuo compito è MASSIMIZZARE LA DIVERSITÀ della ricerca keyword.

TOPIC PRINCIPALE: "${topic}"
DESCRIZIONE BUSINESS: "${businessDescription}"

PROBLEMA DA RISOLVERE: Se cerco solo "${topic}" su DataForSEO, otterrò 20 varianti della stessa keyword.
La tua missione è generare 6 angoli di ricerca SEMANTICAMENTE DIVERSI tra loro.

REGOLA D'ORO: Ogni angolo deve esplorare una PROSPETTIVA COMPLETAMENTE DIVERSA:
1. SERVIZIO CORE: la keyword principale (es. "sgombero appartamenti milano")
2. SERVIZIO PARALLELO: un servizio correlato diverso (es. "traslochi milano", NON "sgombero...")
3. PROBLEMA DEL CLIENTE: cosa cerca chi ha questo problema (es. "smaltimento mobili usati gratis")
4. SOTTO-NICCHIA: variante del servizio meno ovvia (es. "svuotamento cantine milano")
5. ZONA/AREA: focus geografico se presente (es. "sgombero periferia milano nord")
6. INTENT COMMERCIALE: keyword con chiaro intento d'acquisto diverso (es. "preventivo sgombero casa milano")

REGOLE:
- Ogni angolo DEVE essere semanticamente distinto dagli altri
- NO variazioni della stessa keyword (vietato "sgombero appartamenti" E "sgombero appartamenti milano" = troppo simili)
- NO brand names
- In italiano
- 2-4 parole per angolo (devono essere "seed" broad per DataForSEO)

Restituisci SOLO un JSON array di 6 stringhe:
["angolo 1", "angolo 2", "angolo 3", "angolo 4", "angolo 5", "angolo 6"]`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.cleanAndParseJson(response.text());
  }

  async generateSeedKeywords(topic: string, businessDescription: string): Promise<string[]> {
    // Legacy fallback - now using generateTopicAngles for primary flow
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
   * ATQ EXPANSION — "Answer The Public" + "Answer The Question"
   * Phase 2 of the dual-level pipeline.
   * Reads REAL keywords from DataForSEO (source of truth) + the user's
   * business description to generate EXACTLY 30 final long-tail keywords.
   * Forces a strict linguistic taxonomy (Questions, Prepositions, Comparisons).
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
      "siteTitle": "A powerful SEO Title for <title> tag. CRITICAL: STRICT MAXIMUM 55 CHARACTERS! Do not exceed. (string)",
      "metaDescription": "A persuasive meta description (MAX 150 chars) for Google results (string)",
      "footerQuote": "A unique, inspiring editorial quote for the footer about this niche (string)",
      "heroTitle": "Powerful H1 including the keyword. CRITICAL: STRICT MAXIMUM 55 CHARACTERS! (string)",
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
      "guideHeroTitle": "Catchy H1 for the guides section. STRICT MAXIMUM 55 CHARACTERS! (string)",
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
    ${context ? `Ecco alcune informazioni/notizie provenienti da diverse fonti reali (Wikipedia, News, Reddit ecc.) legate all'argomento:\n${context}\n\nISTRUZIONI CRITICHE PER L'OLIMPO ADSEO (IL CITAZIONE ENGINE E E-E-A-T):
    1. CITAZIONE ESPLICITA IN BOX: DEVI inserire esattamente 1 o 2 citazioni testuali prese dalle fonti fornite (scegli SOLO le più rilevanti, ignora gossip o news non correlate all'intent originario). Ogni citazione deve essere racchiusa tra <blockquote class=\"cite-box\">[Testo Citazione]</blockquote>.
    2. COMMENTO POST-CITAZIONE: Sotto ogni citazione, commenta integrando con la tua competenza esperta.
    3. TABELLA DATI/PREZZI (MANDATORIA): Inserisci SEMPRE una tabella HTML ben formattata (<table> con classi Tailwind come 'w-full text-left border-collapse my-8'). Se la keyword è locale (es. "scavi parma"), fai una tabella prezzi dettagliata 2026. Se è generica, una tabella comparativa o di specifiche. Usa DATI CONCRETI (es. "15-35€/m³" e non frasi vuote come "varia molto").
    4. INSIGHT UNICO CONCRETO: Inserisci un paragrafo di esperienza diretta (es: "Nella nostra esperienza cantieristica a Parma, il 30% dei subappalti nasconde costi extra per..."). Sii iper-specifico. Inseriscilo dentro: <div class="bg-brand-50 border-l-4 border-brand-500 p-6 my-8 rounded-r-2xl text-slate-800 font-medium">✨ <em>Esperienza Diretta:</em> ...</div>
    5. ANTI-BOT / ANTI-SLOP: VIETATO usare frasi fatte da AI come: "Evita sorprese", "Non farti fregare", "Parti col piede giusto", "Un preventivo è fondamentale". NIENTE FILLER ripetitivi.
    6. PERSONA EXPERT & BIO: L'Autore non è solo un nome. Crea una qualifica (authorRole) iper-specifica per nicchia e territorio. Esempio vero: "Geometra con 15+ anni in Emilia-Romagna, spec. in movimento terra".` : "Agisci come un esperto senior del settore che fornisce consigli pratici, tabelle di prezzi realistici 2026 e casi studio realistici."}

    Structure:
    - Highly creative and catchy title (H1) incorporating the keyword naturally. CRITICAL INSTRUCTION: STRICT MAXIMUM 55 CHARACTERS! If longer, it fails SEO. Short, punchy.
    - Detailed excerpt (meta description style, 140-155 chars) - make it unique!
    - Introduction: Start with a punchy, expert observation or a direct reference to a trend found in the context (No introductions like "In questo articolo vedremo...").
    - At least 5 sections with descriptive H2 titles.
    - CONTENT: Distribute the 2-3 mandatory <blockquote class=\"cite-box\"> citations inside relevant sections. 
    - MANDATORY: Each citation must be followed by a paragraph of expert commentary.
    - ABSOLUTELY MANDATORY: You MUST include exactly 3 internal <a href=\"[DOMAIN_LINK_ID]/article/relevant-slug\">anchor links</a>.
    - ABSOLUTELY MANDATORY: You MUST include at least 1 external link.
    - Conclusion: Final "Expert Prescription" or strategic advice tailored to the topic. (Do not call it "Ricetta del Dottore SEO" if the niche is gym/law/etc).
    
    Avoid keyword stuffing. Target a high E-E-A-T score.
    
    Return ONLY a JSON object with:
    {
      "title": "Article Title",
      "slug": "url-friendly-slug",
      "excerpt": "Short summary for cards",
      "content": "Full HTML-formatted content. Use <p>, <h2>, <ul>, <blockquote class=\"cite-box\">.",
      "category": "A logical category based on the niche (e.g. Salute, Sport, Tecnologia, Attualità, Business)",
      "tags": ["tag1", "tag2", "tag3"],
      "imageSearchTerm": "English term for a relevant Unsplash image",
      "author": "A realistic Italian full name (e.g. Marco Rossi, Elena Bianchi)",
      "authorRole": "A relevant professional role (e.g. Esperto di Logistica, Redazione, Specialista, Consulente)"
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

  async generateAboutPageContent(domain: string, keyword: string, brandName: string): Promise<any> {
    const prompt = `Write a highly professional and credible "About Us" (Chi Siamo) page in Italian for a project named "${brandName}" on the domain "${domain}".
    Focus keyword/niche: "${keyword}".
    
    CRITICAL E-E-A-T INSTRUCTIONS:
    1. LOCAL FLAVOR: If the keyword implies a location (e.g. "Roma", "Bologna"), position the team as local experts based in that city.
    2. HUMAN TOUCH: Use a professional but human tone. Avoid "AI-slop" phrases. Focus on experience, manual work, and human-supervised AI optimization (for 2026).
    3. STRUCTURE:
       - H1: Catchy, local, and professional (max 60 chars).
       - Intro (150 words): Professional background, years in the industry (e.g., since 2018), and mission.
       - The Team & Expertise (250 words): Details about the number of local projects handled, expertise (e.g., local logistics, web design trends 2026), and the human "why".
       - Trust factors: Mentions of transparency, clear pricing, and respect for the client.
       - Conclusion (100 words): A professional sign-off or "Expert Promise" tailored to the niche.
    
    4. IMAGE SEARCH TERMS: Provide 2 specific English terms for Unsplash images that perfectly match the niche (e.g., "moving truck" for movers, "modern office laptops" for agencies).
    
    Return ONLY a JSON object with:
    {
      "aboutTitle": "H1 for the page",
      "aboutIntro": "Full intro text with HTML <p> tags",
      "aboutTeam": "Full team/expertise section with HTML <p> and <ul> tags",
      "aboutConclusion": "Conclusion text with HTML <p> tags",
      "aboutExcerpt": "Meta description (140-155 chars)",
      "imageSearchTerm1": "First Unsplash term",
      "imageSearchTerm2": "Second Unsplash term"
    }`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.cleanAndParseJson(response.text());
  }
}
