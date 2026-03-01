import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const TEMPLATE_REPO = 'lander-template';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log('--- FINAL PUSH: Master Template SEO & Human Touch ---');
        
        const filesToPush = [
            { path: 'lib/constants.ts', local: path.join(__dirname, '../templates/next-magazine/lib/constants.ts'), msg: 'feat: add guide, youtube and seo constants' },
            { path: 'components/YouTubeVideo.tsx', local: path.join(__dirname, '../templates/next-magazine/components/YouTubeVideo.tsx'), msg: 'feat: dynamic youtube component' },
            { path: 'app/guida/page.tsx', local: path.join(__dirname, '../templates/next-magazine/app/guida/page.tsx'), msg: 'feat: humanized guide page' },
            { path: 'app/page.tsx', local: path.join(__dirname, '../templates/next-magazine/app/page.tsx'), msg: 'feat: optimized home with video and seo' }
        ];

        for (const file of filesToPush) {
            if (fs.existsSync(file.local)) {
                console.log(`Pushing ${file.path}...`);
                const content = fs.readFileSync(file.local, 'utf8');
                await github.commitFile(USERNAME, TEMPLATE_REPO, file.path, content, file.msg);
                console.log(`OK: ${file.path} pushato.`);
            }
        }

        console.log('--- Master Template Aggiornato con Successo ---');

    } catch (err: any) {
        console.error('ERRORE PUSH FINALE:', err.message);
    }
}

main();
