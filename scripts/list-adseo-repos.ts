import { GithubService } from '../src/lib/api/github';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';

async function main() {
    try {
        const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=created`, {
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const repos = await response.json();
        const adseoRepos = repos.filter((r: any) => r.name.startsWith('adseo-') || r.name.includes('template'));
        console.log(JSON.stringify(adseoRepos.map((r: any) => r.name), null, 2));
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

main();
