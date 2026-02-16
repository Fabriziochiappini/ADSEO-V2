
import 'dotenv/config';
import { VercelService } from '../src/lib/api/vercel';

// Polyfill for process.env loading if dotenv/config doesn't pick up .env.local automatically
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function main() {
    const token = process.env.VERCEL_API_TOKEN;
    if (!token) {
        console.error('No VERCEL_API_TOKEN found');
        return;
    }

    const vercel = new VercelService(token, process.env.VERCEL_TEAM_ID);

    try {
        console.log('Fetching projects...');
        const projectsData = await vercel.fetchVercel('/v9/projects?limit=5');
        const projects = projectsData.projects || [];

        console.log(`Found ${projects.length} recent projects:`);

        for (const p of projects) {
            console.log(`\nProject: ${p.name}`);
            console.log(`ID: ${p.id}`);
            console.log(`Created: ${new Date(p.createdAt).toLocaleString()}`);

            const deploymentsData = await vercel.fetchVercel(`/v6/deployments?projectId=${p.id}&limit=1`);
            const deployments = deploymentsData.deployments || [];

            if (deployments.length === 0) {
                console.log('Status: NO DEPLOYMENTS FOUND');
            } else {
                const d = deployments[0];
                console.log(`Latest Deployment: ${d.state}`);
                console.log(`Url: https://${d.url}`);
                if (d.state === 'ERROR' || d.state === 'FAILED') {
                    console.log(`Inspecing error...`);
                    // Try to get more info if possible logic limits allow
                }
            }
        }

    } catch (e: any) {
        console.error('Error fetching Vercel data:', e.message);
        if (e.response) {
            console.error('Response:', await e.response.text());
        }
    }
}

// Add fetchVercel method to class prototype hack or just copy logic?
// We imported VercelService but its `fetchVercel` is private.
// We can use the public methods or cast to any to access private.
// Actually VercelService has public methods but not "list projects".
// I will just use fetch directly in the script for simplicity instead of relying on the class private method.

async function fetchVercelDirect(endpoint: string, token: string, teamId?: string) {
    const url = new URL(`https://api.vercel.com${endpoint}`);
    if (teamId) url.searchParams.append('teamId', teamId);

    const res = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
    return res.json();
}

// Redefine main to use direct fetch
async function run() {
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!token) {
        console.error('No VERCEL_API_TOKEN found in .env.local');
        return;
    }

    console.log(`Using Token: ${token.slice(0, 5)}...`);

    try {
        const projectsData = await fetchVercelDirect('/v9/projects?limit=5', token, teamId);
        const projects = projectsData.projects || [];

        console.log(`Found ${projects.length} recent projects.`);

        for (const p of projects) {
            console.log(`\n------------------------------------------------`);
            console.log(`Project: ${p.name}`);
            console.log(`Link: https://vercel.com/${p.accountId}/${p.name}`);

            const deploymentsData = await fetchVercelDirect(`/v6/deployments?projectId=${p.id}&limit=1`, token, teamId);
            const deployments = deploymentsData.deployments || [];

            if (deployments.length === 0) {
                console.log('Status: NO DEPLOYMENTS (Pending?)');
            } else {
                const d = deployments[0];
                console.log(`Last Deploy State: ${d.state}`);
                console.log(`Created: ${new Date(d.created).toLocaleString()}`);
                if (d.readyState === 'ERROR' || d.state === 'ERROR') {
                    console.log('ERROR DETECTED');
                }
            }
        }
    } catch (e: any) {
        console.error(e);
    }
}

run();

