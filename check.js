const dotenv = require('dotenv');
const env = dotenv.config({ path: '.env.local' }).parsed;

async function checkProjects() {
  const res = await fetch('https://api.vercel.com/v9/projects?limit=100', {
    headers: { 'Authorization': `Bearer ${env.VERCEL_API_TOKEN}` }
  });
  
  const projects = await res.json();
  
  if (projects.projects) {
     const adseoProjects = projects.projects.filter(p => p.name.startsWith('adseo-') || p.name.startsWith('-sg') || p.name.startsWith('sgombero') || p.name.startsWith('siti') || p.name.startsWith('reputazione') || p.name.startsWith('terra') || p.name.startsWith('spazza') || p.name.startsWith('rumeni') || p.name.startsWith('seofrosinone') || p.name.startsWith('weblazio') || p.name.startsWith('matrimonio') || p.name.startsWith('ferramenta') || p.name.startsWith('vetriblindati') || p.name.startsWith('fioraio') || p.name.startsWith('tagli') || p.name.startsWith('coopfrosinone'));
     console.log(`Found ${adseoProjects.length} candidate projects`);
     for (const p of adseoProjects) {
        if(p.link) {
           console.log(`- ${p.name} (Repo: ${p.link.repo})`);
        } else {
           console.log(`- ${p.name} (No repo linked)`);
        }
     }
  }
}

checkProjects();
