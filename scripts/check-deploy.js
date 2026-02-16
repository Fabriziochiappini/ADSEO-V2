
const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...rest] = line.split('=');
        if (key && rest.length > 0) process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    });
}

const token = process.env.VERCEL_API_TOKEN;
const teamId = process.env.VERCEL_TEAM_ID;

if (!token) { console.error('No VERCEL_API_TOKEN'); process.exit(1); }

function fetchVercel(endpoint) {
    return new Promise((resolve, reject) => {
        const url = new URL(`https://api.vercel.com${endpoint}`);
        if (teamId) url.searchParams.append('teamId', teamId);
        const req = https.request(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => res.statusCode < 300 ? resolve(JSON.parse(data)) : reject(new Error(`API ${res.statusCode}: ${data}`)));
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    try {
        console.log('Fetching latest project...');
        const projectsData = await fetchVercel('/v9/projects?limit=1');
        const p = projectsData.projects?.[0];

        if (!p) { console.log('No projects'); return; }

        console.log(`\nProject: ${p.name} (${p.id})`);

        const deploymentsData = await fetchVercel(`/v6/deployments?projectId=${p.id}&limit=1`);
        const d = deploymentsData.deployments?.[0];

        if (!d) { console.log('No deployments found'); return; }

        console.log(`Deployment ID: ${d.uid}`);
        console.log(`State: ${d.state}`);
        console.log(`Error Code:`, d.errorCode || 'None');
        console.log(`Error Message:`, d.errorMessage || 'None'); // Might be in other fields

        // Fetch build logs if possible (requires different endpoint usually)
        // Or inspect deployment details
        try {
            const details = await fetchVercel(`/v13/deployments/${d.uid}`);
            if (details.error) {
                console.log('Full Error:', JSON.stringify(details.error, null, 2));
            } else {
                console.log('No top-level error in details.');
            }
        } catch (e) { console.log('Error fetching details:', e.message); }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

run();
