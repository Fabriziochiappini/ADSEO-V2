const token = process.env.GITHUB_TOKEN;

async function checkRepos() {
    console.log('Checking recent repositories for Fabriziochiappini...');
    
    try {
        const res = await fetch('https://api.github.com/user/repos?sort=created&direction=desc&per_page=10', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!res.ok) {
            console.error('GitHub API Error:', res.status, res.statusText);
            return;
        }

        const repos = await res.json();
        console.log('--- Last 10 Repos ---');
        repos.forEach(r => {
            console.log(`[${r.private ? 'PRIVATE' : 'PUBLIC'}] ${r.full_name} (Created: ${r.created_at})`);
        });

    } catch (e) {
        console.error('Fetch error:', e);
    }
}

checkRepos();