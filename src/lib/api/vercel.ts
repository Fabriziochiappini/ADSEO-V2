const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

const BASE_URL = 'https://api.vercel.com';

export class VercelService {
    private token: string;
    private teamId?: string;

    constructor() {
        this.token = VERCEL_TOKEN || '';
        this.teamId = VERCEL_TEAM_ID;
    }

    private get headers() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }

    // 1. Create a Project
    async createProject(projectName: string) {
        if (!this.token) throw new Error('Vercel Token missing');

        const url = new URL(`${BASE_URL}/v9/projects`);
        if (this.teamId) url.searchParams.append('teamId', this.teamId);

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                name: projectName,
                framework: 'nextjs',
                // We can specify git repository here later
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Vercel Create Project Failed: ${error.message}`);
        }

        return response.json();
    }

    // 2. Add Domain to Project
    async addDomain(projectId: string, domain: string) {
        if (!this.token) throw new Error('Vercel Token missing');

        const url = new URL(`${BASE_URL}/v9/projects/${projectId}/domains`);
        if (this.teamId) url.searchParams.append('teamId', this.teamId);

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                name: domain,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Vercel Add Domain Failed: ${error.message}`);
        }

        return response.json();
    }
}

export const vercel = new VercelService();
