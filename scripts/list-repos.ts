import { GithubService } from '../src/lib/api/github';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log('--- List Repos (Viterbo search) ---');
        // Fetching repos manually via fetch since GithubService might only have commitFile
        const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`, {
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const repos = await response.json();
        const viterboRepos = repos.filter((r: any) => r.name.toLowerCase().includes('viterbo'));
        console.log(JSON.stringify(viterboRepos.map((r: any) => r.name), null, 2));
    } catch (err: any) {
        console.error('Error listing repos:', err.message);
    }
}

main();
