import { XMLParser } from 'fast-xml-parser';

const NAMECHEAP_USER = process.env.NAMECHEAP_USER;
const NAMECHEAP_KEY = process.env.NAMECHEAP_KEY;
const NAMECHEAP_IP = process.env.NAMECHEAP_CLIENT_IP || '0.0.0.0'; // Caller IP
const IS_SANDBOX = process.env.NODE_ENV === 'development'; // Use sandbox in dev? Or param.

// Namecheap API Base URLs
const SANDBOX_URL = 'https://api.sandbox.namecheap.com/xml.response';
const PROD_URL = 'https://api.namecheap.com/xml.response';

const BASE_URL = IS_SANDBOX ? SANDBOX_URL : PROD_URL; // Configurable

export class NamecheapService {
    private user: string;
    private key: string;
    private clientIp: string;

    constructor() {
        this.user = NAMECHEAP_USER || '';
        this.key = NAMECHEAP_KEY || '';
        this.clientIp = NAMECHEAP_IP;
    }

    // Helper to build URL with common params
    private buildUrl(command: string, params: Record<string, string>): string {
        const url = new URL(BASE_URL);
        url.searchParams.append('ApiUser', this.user);
        url.searchParams.append('ApiKey', this.key);
        url.searchParams.append('UserName', this.user);
        url.searchParams.append('ClientIp', this.clientIp);
        url.searchParams.append('Command', command);

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        return url.toString();
    }

    async checkAvailability(domain: string): Promise<boolean> {
        if (!this.user || !this.key) {
            console.warn('Namecheap credentials missing');
            return false; // Or throw
        }

        const startUrl = this.buildUrl('namecheap.domains.check', {
            DomainList: domain
        });

        try {
            const response = await fetch(startUrl);
            const text = await response.text();

            const parser = new XMLParser({ ignoreAttributes: false });
            const jsonObj = parser.parse(text);

            // Parse XML response logic here (Namecheap returns XML)
            // Example path: ApiResponse.CommandResponse.DomainCheckResult.@_Available
            const result = jsonObj?.ApiResponse?.CommandResponse?.DomainCheckResult;
            const isAvailable = result?.['@_Available'] === 'true';

            return isAvailable;
        } catch (error) {
            console.error('Namecheap check failed:', error);
            return false;
        }
    }
}

export const namecheap = new NamecheapService();
