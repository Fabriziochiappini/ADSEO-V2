import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const TEMPLATE_REPO = 'lander-template';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log('--- FINAL FINAL PUSH: Master Template Complete ---');
        
        const filesToPush = [
            { path: 'app/layout.tsx', local: path.join(__dirname, '../templates/next-magazine/app/layout.tsx'), msg: 'fix: final layout refinement' },
            { path: 'app/article/[slug]/page.tsx', local: path.join(__dirname, '../templates/next-magazine/app/article/[slug]/page.tsx'), msg: 'fix: article page refined' },
            { path: 'components/ServiceSection.tsx', local: path.join(__dirname, '../templates/next-magazine/components/ServiceSection.tsx'), msg: 'fix: neutralize text' },
            { path: 'lib/constants.ts', local: path.join(__dirname, '../templates/next-magazine/lib/constants.ts'), msg: 'fix: neutralize text in constants' }
        ];

        for (const file of filesToPush) {
            if (fs.existsSync(file.local)) {
                console.log(`Pushing ${file.path}...`);
                const content = fs.readFileSync(file.local, 'utf8');
                await github.commitFile(USERNAME, TEMPLATE_REPO, file.path, content, file.msg);
            }
        }
        console.log('--- Tutto completato ---');
    } catch (err: any) {
        console.error('ERRORE:', err.message);
    }
}
main();
