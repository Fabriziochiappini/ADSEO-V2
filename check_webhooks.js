const dotenv = require('dotenv');
const env = dotenv.config({ path: '.env.local' }).parsed;

async function disableDeploymentsHooks() {
  const res = await fetch('https://api.vercel.com/v9/projects?limit=100', {
    headers: { 'Authorization': `Bearer ${env.VERCEL_API_TOKEN}` }
  });
  
  const projects = await res.json();
  const adseoProjects = projects.projects.filter(p => p.name.startsWith('adseo-') || p.name.startsWith('sg') || p.name.startsWith('siti') || p.name.startsWith('reputazione') || p.name.startsWith('terra') || p.name.startsWith('spazza') || p.name.startsWith('rumeni') || p.name.startsWith('seo') || p.name.startsWith('web') || p.name.startsWith('matrimonio') || p.name.startsWith('ferramenta') || p.name.startsWith('vetriblindati') || p.name.startsWith('fioraio') || p.name.startsWith('tagli') || p.name.startsWith('coopfrosinone') || p.name.startsWith('prova'));
  
  for (const p of adseoProjects) {
     if(p.link && p.link.repo === 'lander-template') {
        console.log(`Found project ${p.name} linked to lander-template (ProjectID: ${p.id})`);
     }
  }
}

disableDeploymentsHooks();
