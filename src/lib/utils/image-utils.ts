const UNSPLASH_IMAGES = [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200', // Analytics
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200', // Dashboard
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200', // Planning
    'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=1200', // Coding
    'https://images.unsplash.com/photo-1553877615-30c73094c6af?auto=format&fit=crop&q=80&w=1200', // Meeting
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200', // Office
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200', // Teamwork
    'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=1200', // Marketing
    'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=1200', // Apple
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1200', // Typing
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=1200', // Workplace
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200', // Brainstorming
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200', // Conference
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200', // Handshake
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200', // Collaborative
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200', // Startup
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1200', // Team
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=1200', // Payment
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200', // Executive
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200'  // Business Women
];

/**
 * Utility per generare URL di immagini stabili e contestualizzate
 * Assicura che l'immagine rimanga la stessa per un dato articolo/topic (bloccata con un seed)
 */
export function getDynamicImageUrl(searchTerm: string, seed: string = ''): string {
    // Genera un hash numerico semplice basato sul seed (es: slug articolo)
    // Se non c'è seed, usiamo il topic stesso
    const stringToHash = seed || searchTerm || 'default';
    let hash = 0;
    for (let i = 0; i < stringToHash.length; i++) {
        hash = (hash << 5) - hash + stringToHash.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    
    // Seleziona un'immagine dalla lista curata basandosi sull'hash
    const index = Math.abs(hash) % UNSPLASH_IMAGES.length;
    return UNSPLASH_IMAGES[index];
}
