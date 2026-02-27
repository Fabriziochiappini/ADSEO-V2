const { execSync } = require('child_process');
const dotenv = require('dotenv');

const env = dotenv.config({ path: '.env.local' }).parsed;
const token = env.GITHUB_TOKEN;

async function checkRepos() {
  const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  const repos = await res.json();
  const adseoRepos = repos.filter(r => r.name.startsWith('adseo-') || r.name.startsWith('adseo_'));
  
  console.log(`Found ${adseoRepos.length} adseo repositories`);
  adseoRepos.forEach(r => {
    console.log(`- ${r.name} (fork: ${r.fork})`);
  });
}

checkRepos();
