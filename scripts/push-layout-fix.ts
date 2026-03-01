import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const TEMPLATE_REPO = 'lander-template';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log('--- FIX: Pushing Layout and GoogleAnalytics ---');
        
        const files = [
            { path: 'app/layout.tsx', local: path.join(__dirname, '../templates/next-magazine/app/layout.tsx'), msg: 'fix: resolve GoogleAnalytics import and update colors' },
            { path: 'components/GoogleAnalytics.tsx', local: path.join(__dirname, '../templates/next-magazine/components/GoogleAnalytics.tsx'), msg: 'fix: add missing GoogleAnalytics component' }
        ];

        for (const file of files) {
            console.log(`Pushing ${file.path}...`);
            const content = fs.readFileSync(file.local, 'utf8');
            await github.commitFile(USERNAME, TEMPLATE_REPO, file.path, content, file.msg);
            console.log(`OK: ${file.path} pushato.`);
        }

        console.log('--- Fix completato ---');

    } catch (err: any) {
        console.error('ERRORE DURANTE IL FIX:', err.message);
    }
}

main();
