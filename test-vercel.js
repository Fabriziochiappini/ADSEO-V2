const dotenv = require('dotenv');

const env = dotenv.config({ path: '.env.local' }).parsed;
const token = env.VERCEL_API_TOKEN;

async function checkProjects() {
  const res = await fetch('https://api.vercel.com/v9/projects?limit=100', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const projects = await res.json();
  
  if(projects.projects) {
     const adseoProjects = projects.projects.map(p => {
       return {
         name: p.name,
         repo: p.link ? `${p.link.type}:${p.link.repo}` : 'none'
       }
     });
     console.log(`Found ${adseoProjects.length} projects`);
     adseoProjects.forEach(p => console.log(`- ${p.name} -> ${p.repo}`));
  } else {
     console.log(projects);
  }
}

checkProjects();
