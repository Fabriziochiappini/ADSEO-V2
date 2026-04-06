import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log('--- FIX: Pushing ISR Caching to Selected Child Repositories ---');
        
        const filesToPush = [
            { path: 'app/article/[slug]/page.tsx', local: path.join(__dirname, '../templates/next-magazine-v2/app/article/[slug]/page.tsx'), msg: 'fix: enable ISR caching for article pages to reduce CPU usage' },
            { path: 'app/icon.tsx', local: path.join(__dirname, '../templates/next-magazine-v2/app/icon.tsx'), msg: 'perf: cache dynamic icon generation' },
            { path: 'app/apple-icon.tsx', local: path.join(__dirname, '../templates/next-magazine-v2/app/apple-icon.tsx'), msg: 'perf: cache dynamic apple icon generation' }
        ];

        for (const repo of TARGET_REPOS) {
            console.log(`\nAggiornamento repository: ${repo}`);
            for (const file of filesToPush) {
                try {
                    const content = fs.readFileSync(file.local, 'utf8');
                    await github.commitFile(USERNAME, repo, file.path, content, file.msg);
                    console.log(`  -> File ${file.path} pushato con successo.`);
                } catch (e: any) {
                    console.error(`  -> Errore file ${file.path}:`, e.message);
                }
            }
        }
        console.log('\n--- Fix Caching Completato per i 6 figli ---');
    } catch (err: any) {
        console.error('ERRORE DURANTE IL FIX:', err.message);
    }
}
main();
