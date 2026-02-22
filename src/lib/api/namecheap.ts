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

    async getDomainPrice(tld: string): Promise<number | null> {
        if (!this.user || !this.key) return null;

        const startUrl = this.buildUrl('namecheap.users.getPricing', {
            ProductType: 'DOMAIN',
            ProductCategory: 'REGISTER',
            ActionName: 'REGISTER',
            ProductName: tld.toUpperCase()
        });

        try {
            const response = await fetch(startUrl);
            const text = await response.text();

            const parser = new XMLParser({ ignoreAttributes: false });
            const jsonObj = parser.parse(text);

            const errors = jsonObj?.ApiResponse?.Errors?.Error;
            if (errors) return null;

            const productType = jsonObj?.ApiResponse?.CommandResponse?.UserGetPricingResult?.ProductType;
            const category = Array.isArray(productType) ? productType[0]?.ProductCategory : productType?.ProductCategory;
            const product = Array.isArray(category) ? category[0]?.Product : category?.Product;

            const prices = Array.isArray(product) ? product[0]?.Price : product?.Price;

            if (Array.isArray(prices)) {
                const oneYear = prices.find((p: any) => p['@_Duration'] === '1' && p['@_DurationType'] === 'YEAR');
                if (oneYear && oneYear['@_Price']) {
                    return parseFloat(oneYear['@_Price']);
                }
            } else if (prices && prices['@_Duration'] === '1' && prices['@_Price']) {
                return parseFloat(prices['@_Price']);
            }

            return null;
        } catch (e) {
            console.error('Error fetching domain price API:', e);
            return null;
        }
    }

    async checkAvailability(domain: string): Promise<{ available: boolean, error?: string, price?: number }> {
        if (!this.user || !this.key) {
            console.warn('Namecheap credentials missing');
            return { available: false, error: 'Credentials Missing' };
        }

        const startUrl = this.buildUrl('namecheap.domains.check', {
            DomainList: domain
        });

        try {
            console.log(`Checking availability for: ${domain}`);
            const response = await fetch(startUrl);
            const text = await response.text();

            const parser = new XMLParser({ ignoreAttributes: false });
            const jsonObj = parser.parse(text);

            // 1. Check for API Errors (e.g., IP not whitelisted)
            const errors = jsonObj?.ApiResponse?.Errors?.Error;
            if (errors) {
                const errorMsg = typeof errors === 'string' ? errors : (Array.isArray(errors) ? errors[0]['#text'] : (errors['#text'] || 'API Error'));
                console.error(`Namecheap API Error for ${domain}:`, errorMsg);
                return { available: false, error: errorMsg };
            }

            // 2. Parse Result
            const commandResponse = jsonObj?.ApiResponse?.CommandResponse;
            const result = commandResponse?.DomainCheckResult;

            // Note: result can be an array if multiple domains were checked
            const domainResult = Array.isArray(result) ? result[0] : result;
            const isAvailable = domainResult?.['@_Available'] === 'true' || domainResult?.['@_Available'] === true;

            let price: number | undefined = undefined;
            if (isAvailable) {
                const isPremium = domainResult?.['@_IsPremiumName'] === 'true' || domainResult?.['@_IsPremiumName'] === true;
                if (isPremium && domainResult?.['@_PremiumRegistrationPrice']) {
                    price = parseFloat(domainResult['@_PremiumRegistrationPrice']);
                } else {
                    const tld = domain.split('.').pop();
                    if (tld) {
                        const basePrice = await this.getDomainPrice(tld);
                        if (basePrice !== null) {
                            price = basePrice;
                        }
                    }
                }
            }

            console.log(`Domain ${domain} availability:`, isAvailable, 'price:', price);
            return { available: isAvailable, price };
        } catch (error: any) {
            console.error('Namecheap fetch error:', error);
            return { available: false, error: error.message };
        }
    }

    async registerDomain(domain: string): Promise<boolean> {
        if (!this.user || !this.key) return false;

        console.log(`[NAMECHEAP] Attempting to register domain ${domain}...`);

        // Generate contact details required by Namecheap (fallback to env vars or safe defaults)
        const contactDefault = {
            FirstName: process.env.NAMECHEAP_FIRST_NAME || 'Domain',
            LastName: process.env.NAMECHEAP_LAST_NAME || 'Admin',
            Address1: process.env.NAMECHEAP_ADDRESS || '123 Tech Street',
            City: process.env.NAMECHEAP_CITY || 'San Francisco',
            StateProvince: process.env.NAMECHEAP_STATE || 'CA',
            PostalCode: process.env.NAMECHEAP_ZIP || '94105',
            Country: process.env.NAMECHEAP_COUNTRY || 'US',
            Phone: process.env.NAMECHEAP_PHONE || '+1.5555555555',
            EmailAddress: process.env.NAMECHEAP_EMAIL || 'admin@example.com'
        };

        const contactParams: Record<string, string> = {};
        const roles = ['Registrant', 'Tech', 'Admin', 'AuxBilling'];

        roles.forEach(role => {
            contactParams[`${role}FirstName`] = contactDefault.FirstName;
            contactParams[`${role}LastName`] = contactDefault.LastName;
            contactParams[`${role}Address1`] = contactDefault.Address1;
            contactParams[`${role}City`] = contactDefault.City;
            contactParams[`${role}StateProvince`] = contactDefault.StateProvince;
            contactParams[`${role}PostalCode`] = contactDefault.PostalCode;
            contactParams[`${role}Country`] = contactDefault.Country;
            contactParams[`${role}Phone`] = contactDefault.Phone;
            contactParams[`${role}EmailAddress`] = contactDefault.EmailAddress;
        });

        const startUrl = this.buildUrl('namecheap.domains.create', {
            DomainName: domain,
            Years: '1',
            ...contactParams
        });

        try {
            const response = await fetch(startUrl);
            const text = await response.text();

            // Check for success or error
            if (text.includes('<Error>')) {
                const parser = new XMLParser({ ignoreAttributes: false });
                const jsonObj = parser.parse(text);
                const errors = jsonObj?.ApiResponse?.Errors?.Error;
                const errorMsg = typeof errors === 'string' ? errors : (Array.isArray(errors) ? errors[0]['#text'] : (errors?.['#text'] || 'API Error'));
                console.error(`Namecheap registration error for ${domain}:`, errorMsg);
                return false;
            }

            console.log(`[NAMECHEAP] Domain ${domain} successfully registered.`);
            return true;
        } catch (e) {
            console.error('Registration failed via API:', e);
            return false;
        }
    }

    // 3. Set DNS to Vercel
    async setVercelDNS(domain: string): Promise<boolean> {
        if (!this.user || !this.key) return false;

        // Command: namecheap.domains.dns.setCustom
        // SLD/TLD separation needed
        const [sld, tld] = domain.split('.');

        const startUrl = this.buildUrl('namecheap.domains.dns.setCustom', {
            SLD: sld,
            TLD: tld,
            Nameservers: 'ns1.vercel-dns.com,ns2.vercel-dns.com'
        });

        try {
            const response = await fetch(startUrl);
            const text = await response.text();
            // Check success in XML
            return text.includes('CommandResponse') && !text.includes('Error');
        } catch (e) {
            console.error('DNS set failed', e);
            return false;
        }
    }
}

export const namecheap = new NamecheapService();
