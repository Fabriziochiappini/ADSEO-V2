const dotenv = require('dotenv');
const env = dotenv.config({ path: '.env.local' }).parsed;

async function deleteProjectsLinkedToTemplate() {
    const res = await fetch('https://api.vercel.com/v9/projects?limit=100', {
        headers: { 'Authorization': `Bearer ${env.VERCEL_API_TOKEN}` }
    });

    const projects = await res.json();

    if (!projects.projects) {
        console.error('Failed to get projects:', projects);
        return;
    }

    const linkedProjects = projects.projects.filter(p => p.link && p.link.repo === 'lander-template');

    console.log(`Found ${linkedProjects.length} Vercel projects linked directly to 'lander-template'.`);

    for (const p of linkedProjects) {
        console.log(`Deleting Vercel project: ${p.name} (ID: ${p.id})...`);
        const delRes = await fetch(`https://api.vercel.com/v9/projects/${p.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${env.VERCEL_API_TOKEN}` }
        });

        if (delRes.ok) {
            console.log(`Successfully deleted ${p.name}`);
        } else {
            const err = await delRes.text();
            console.error(`Failed to delete ${p.name}:`, err);
        }
    }
}

deleteProjectsLinkedToTemplate();
