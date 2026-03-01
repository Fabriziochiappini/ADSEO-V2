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

    /**
     * Esegue un commit atomico di più file contemporaneamente
     * @param owner Owner del repo
     * @param repo Nome del repo
     * @param files Array di oggetti { path, content }
     * @param message Messaggio del commit
     * @param branch Branch di destinazione (default 'main')
     */
    async commitFiles(
        owner: string,
        repo: string,
        files: { path: string, content: string }[],
        message: string,
        branch: string = 'main'
    ) {
        console.log(`[GitHub] Committing ${files.length} files to ${owner}/${repo} as a single commit...`);

        try {
            // 1. Get the current branch SHA
            const ref = await this.fetchGithub(`/repos/${owner}/${repo}/git/refs/heads/${branch}`);
            const currentCommitSha = ref.object.sha;

            // 2. Get the current commit's tree SHA
            const commit = await this.fetchGithub(`/repos/${owner}/${repo}/git/commits/${currentCommitSha}`);
            const baseTreeSha = commit.tree.sha;

            // 3. Create the new tree
            const treeItems = files.map(file => ({
                path: file.path,
                mode: '100644', // blob (normal file)
                type: 'blob',
                content: file.content
            }));

            const newTree = await this.fetchGithub(`/repos/${owner}/${repo}/git/trees`, {
                method: 'POST',
                body: JSON.stringify({
                    base_tree: baseTreeSha,
                    tree: treeItems
                })
            });

            // 4. Create the commit
            const newCommit = await this.fetchGithub(`/repos/${owner}/${repo}/git/commits`, {
                method: 'POST',
                body: JSON.stringify({
                    message,
                    tree: newTree.sha,
                    parents: [currentCommitSha]
                })
            });

            // 5. Update the reference
            const result = await this.fetchGithub(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    sha: newCommit.sha,
                    force: false
                })
            });

            console.log(`[GitHub] Successfully committed all files with SHA: ${newCommit.sha}`);
            return result;
        } catch (error: any) {
            console.error(`[GitHub] Multi-file commit failed:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const github = new GithubService(
    process.env.GITHUB_TOKEN || '',
    process.env.GITHUB_USERNAME || 'Fabriziochiappini'
);