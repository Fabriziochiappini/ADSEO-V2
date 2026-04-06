import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';

const TARGET_REPOS = [
    'adseo-traslochitopmilano-com',
    'adseo-sgomberorapidomilano-com',
    'adseo-ritiromobilimilano-com',
    'adseo-sitofacilefirenze-com',
    'adseo-bolognaweb-com',
    'adseo-websitipiacenza-com'
];

async function commitFile(repo, filePath, content, message) {
    const url = `https://api.github.com/repos/${USERNAME}/${repo}/contents/${filePath}`;
    const headers = {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NodeJS'
    };

    // get sha
    const res = await fetch(url, { headers });
    let sha = '';
    if (res.ok) {
        const data = await res.json();
        sha = typeof Object(data).sha === 'string' ? Object(data).sha : '';
    } // if not ok, it might not exist yet -> we create it

    const body = {
        message,
        content: Buffer.from(content).toString('base64')
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
    });

    if (!putRes.ok) {
        const err = await putRes.text();
        throw new Error(err);
    }
}

async function main() {
    try {
        console.log('--- FIX: Pushing ISR Caching to Selected Child Repositories ---');
        
        const filesToPush = [
            { path: 'app/article/[slug]/page.tsx', local: path.resolve('templates/next-magazine-v2/app/article/[slug]/page.tsx'), msg: 'fix: enable ISR caching for article pages to reduce CPU usage' },
            { path: 'app/icon.tsx', local: path.resolve('templates/next-magazine-v2/app/icon.tsx'), msg: 'perf: cache dynamic icon generation' },
            { path: 'app/apple-icon.tsx', local: path.resolve('templates/next-magazine-v2/app/apple-icon.tsx'), msg: 'perf: cache dynamic apple icon generation' }
        ];

        for (const repo of TARGET_REPOS) {
            console.log(`\nAggiornamento repository: ${repo}`);
            for (const file of filesToPush) {
                try {
                    const content = fs.readFileSync(file.local, 'utf8');
                    await commitFile(repo, file.path, content, file.msg);
                    console.log(`  -> File ${file.path} pushato con successo.`);
                } catch (e) {
                    console.error(`  -> Errore file ${file.path}:`, e.message);
                }
            }
        }
        console.log('\n--- Fix Caching Completato per i 6 figli ---');
    } catch (err) {
        console.error('ERRORE DURANTE IL FIX:', err.message);
    }
}
main();
