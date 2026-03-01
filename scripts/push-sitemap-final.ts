import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const TEMPLATE_REPO = 'lander-template';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log('--- Push iniziata con nuovo Token ---');
        
        const sitemapPath = path.join(__dirname, '../templates/next-magazine/app/sitemap.ts');
        const robotsPath = path.join(__dirname, '../templates/next-magazine/app/robots.ts');
        const layoutPath = path.join(__dirname, '../templates/next-magazine/app/layout.tsx');
        const constantsPath = path.join(__dirname, '../templates/next-magazine/lib/constants.ts');

        const files = [
            { path: 'app/sitemap.ts', local: sitemapPath, msg: 'feat: add dynamic sitemap for robots' },
            { path: 'app/robots.ts', local: robotsPath, msg: 'feat: add robots.txt' },
            { path: 'app/layout.tsx', local: layoutPath, msg: 'feat: add dynamic SEO metadata to layout' },
            { path: 'lib/constants.ts', local: constantsPath, msg: 'feat: add dynamic SEO constants' }
        ];

        for (const file of files) {
            console.log(`Pushing ${file.path}...`);
            const content = fs.readFileSync(file.local, 'utf8');
            await github.commitFile(USERNAME, TEMPLATE_REPO, file.path, content, file.msg);
            console.log(`OK: ${file.path} pushato.`);
        }

        console.log('--- Push completata con successo sul Master Template ---');

    } catch (err: any) {
        console.error('ERRORE CRITICO DURANTE IL PUSH:', err.message);
    }
}

main();
