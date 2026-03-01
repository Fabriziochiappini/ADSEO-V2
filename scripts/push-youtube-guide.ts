import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const TEMPLATE_REPO = 'lander-template';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log('--- Push iniziata: YouTube & Guide Integration ---');
        
        const filesToPush = [
            { path: 'lib/constants.ts', local: path.join(__dirname, '../templates/next-magazine/lib/constants.ts'), msg: 'feat: add guide and youtube constants' },
            { path: 'components/YouTubeVideo.tsx', local: path.join(__dirname, '../templates/next-magazine/components/YouTubeVideo.tsx'), msg: 'feat: add premium YouTubeVideo component' },
            { path: 'app/guida/page.tsx', local: path.join(__dirname, '../templates/next-magazine/app/guida/page.tsx'), msg: 'feat: add dynamic guide page' },
            { path: 'app/page.tsx', local: path.join(__dirname, '../templates/next-magazine/app/page.tsx'), msg: 'feat: integrate video and guide link in home' }
        ];

        for (const file of filesToPush) {
            console.log(`Pushing ${file.path}...`);
            if (!fs.existsSync(file.local)) {
               console.error(`Missing local file: ${file.local}`);
               continue;
            }
            const content = fs.readFileSync(file.local, 'utf8');
            await github.commitFile(USERNAME, TEMPLATE_REPO, file.path, content, file.msg);
            console.log(`OK: ${file.path} pushato.`);
        }

        console.log('--- YouTube & Guide Deployment completed successfully ---');

    } catch (err: any) {
        console.error('ERRORE DURANTE IL PUSH YOUTUBE/GUIDE:', err.message);
    }
}

main();
