const dotenv = require('dotenv');
const env = dotenv.config({ path: '.env.local' }).parsed;

const projectsToDetach = ['prj_HvcLKodMJu6joD1JXCtPcmJuSsAZ', 'prj_C50mHy0y7s9GCAvacW582bq5Av37'];

async function detachProjects() {
  for (const prjId of projectsToDetach) {
    const res = await fetch(`https://api.vercel.com/v9/projects/${prjId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serverlessFunctionRegion: null // Not strictly needed but forces an update payload
      })
    });
    // Wait Vercel doesn't allow unlinking repo simply by setting link: null in patch. Check Vercel API
    console.log(`Checking project ${prjId}`);
  }
}

detachProjects();
