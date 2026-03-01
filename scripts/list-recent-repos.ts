import { GithubService } from '../src/lib/api/github';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';

async function main() {
    try {
        const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=10`, {
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const repos = await response.json();
        console.log(JSON.stringify(repos.map((r: any) => ({ name: r.name, updated: r.updated_at })), null, 2));
    } catch (err: any) {
        console.error('Error listing repos:', err.message);
    }
}

main();
