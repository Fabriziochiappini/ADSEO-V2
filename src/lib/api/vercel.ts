export class VercelService {
    private token: string;
    private teamId?: string;

    constructor(token: string, teamId?: string) {
        this.token = token;
        this.teamId = teamId;
    }

    private async fetchVercel(endpoint: string, options: any = {}) {
        const url = new URL(`https://api.vercel.com${endpoint}`);
        if (this.teamId) url.searchParams.append('teamId', this.teamId);

        const res = await fetch(url.toString(), {
            ...options,
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error?.message || `Vercel API Error: ${res.statusText}`);
        }

        return res.json();
    }

    async createProject(name: string, repo: string, envVars: { key: string, value: string }[] = []) {
        return this.fetchVercel('/v9/projects', {
            method: 'POST',
            body: JSON.stringify({
                name,
                gitRepository: {
                    type: 'github',
                    repo: repo,
                },
                framework: 'nextjs',
                environmentVariables: envVars.map(v => ({
                    key: v.key,
                    value: v.value,
                    type: 'plain',
                    target: ['production', 'preview', 'development'],
                })),
            }),
        });
    }

    async setEnvVariable(projectId: string, key: string, value: string) {
        return this.fetchVercel(`/v10/projects/${projectId}/env`, {
            method: 'POST',
            body: JSON.stringify({
                key,
                value,
                type: 'plain',
                target: ['production', 'preview', 'development'],
            }),
        });
    }

    async addDomain(projectId: string, domain: string) {
        return this.fetchVercel(`/v9/projects/${projectId}/domains`, {
            method: 'POST',
            body: JSON.stringify({
                name: domain,
            }),
        });
    }

    async getDomainConfig(domain: string) {
        return this.fetchVercel(`/v6/domains/${domain}/config`);
    }

    async createDeployment(projectId: string, name: string) {
        return this.fetchVercel('/v13/deployments', {
            method: 'POST',
            body: JSON.stringify({
                name,
                project: projectId,
                gitSource: {
                    type: 'github',
                    repoId: projectId, // Vercel often uses project ID or internal repo ID
                    ref: 'main'
                }
            }),
        });
    }
}

export const vercel = new VercelService(process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN || '', process.env.VERCEL_TEAM_ID);
