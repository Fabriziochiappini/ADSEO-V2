
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

// Direct fetch helper to avoid private method access issues
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

