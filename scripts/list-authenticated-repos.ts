import { GithubService } from '../src/lib/api/github';

const TOKEN = process.env.GITHUB_TOKEN || '';

async function main() {
    try {
        const response = await fetch(`https://api.github.com/user/repos?per_page=100&sort=updated`, {
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const repos = await response.json();
        if (Array.isArray(repos)) {
            console.log(JSON.stringify(repos.map((r: any) => r.full_name), null, 2));
        } else {
            console.log(JSON.stringify(repos, null, 2));
        }
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

main();
