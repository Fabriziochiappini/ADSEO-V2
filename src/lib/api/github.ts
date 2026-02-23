export class GithubService {
    private token: string;
    private username: string;

    constructor(token: string, username: string = 'Fabriziochiappini') {
        this.token = token;
        this.username = username;
    }

    private async fetchGithub(endpoint: string, options: any = {}) {
        const url = `https://api.github.com${endpoint}`;

        const res = await fetch(url, {
            ...options,
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                ...options.headers,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || `GitHub API Error: ${res.statusText}`);
        }

        return res.json();
    }

    /**
     * Crea un nuovo repository a partire da un template
     * @param templateOwner Owner del template (es. Fabriziochiappini)
     * @param templateRepo Nome del repo template (es. lander-template)
     * @param newRepoName Nome del nuovo repo da creare
     * @param isPrivate Se il nuovo repo deve essere privato (default true)
     */
    async createRepoFromTemplate(
        templateOwner: string,
        templateRepo: string,
        newRepoName: string,
        isPrivate: boolean = true
    ) {
        console.log(`[GitHub] Creating repo ${newRepoName} from template ${templateOwner}/${templateRepo}...`);

        // Sanitize repo name (solo lettere, numeri, trattini)
        const sanitizedName = newRepoName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();

        try {
            // Check if repo already exists first to avoid errors
            try {
                await this.fetchGithub(`/repos/${this.username}/${sanitizedName}`);
                console.log(`[GitHub] Repo ${sanitizedName} already exists. Using existing.`);
                return {
                    name: sanitizedName,
                    full_name: `${this.username}/${sanitizedName}`,
                    html_url: `https://github.com/${this.username}/${sanitizedName}`,
                    exists: true
                };
            } catch (e) {
                // Repo doesn't exist, proceed to create
            }

            const result = await this.fetchGithub(`/repos/${templateOwner}/${templateRepo}/generate`, {
                method: 'POST',
                body: JSON.stringify({
                    owner: this.username,
                    name: sanitizedName,
                    description: `ADSEO Site generated from ${templateRepo}`,
                    include_all_branches: false,
                    private: isPrivate
                })
            });

            console.log(`[GitHub] Successfully created ${result.full_name}`);
            return result;
        } catch (error: any) {
            console.error(`[GitHub] Failed to create repo:`, error);
            throw error;
        }
    }
    /**
     * Crea o aggiorna un file in un repo esistente (PUT /contents/{path})
     * @param owner Owner del repo
     * @param repo Nome del repo
     * @param path Path del file nel repo (es. 'app/layout.tsx')
     * @param content Contenuto del file (stringa)
     * @param message Commit message
     */
    async commitFile(
        owner: string,
        repo: string,
        path: string,
        content: string,
        message: string
    ) {
        // Get current file SHA (required for update)
        let sha: string | undefined;
        try {
            const existing = await this.fetchGithub(`/repos/${owner}/${repo}/contents/${path}`);
            sha = existing.sha;
        } catch {
            // File doesn't exist yet — create it
        }

        const body: any = {
            message,
            content: Buffer.from(content).toString('base64'),
        };
        if (sha) body.sha = sha;

        return this.fetchGithub(`/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }
}

// Export singleton instance
export const github = new GithubService(
    process.env.GITHUB_TOKEN || '',
    process.env.GITHUB_USERNAME || 'Fabriziochiappini'
);