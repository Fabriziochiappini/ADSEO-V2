import { github } from '../src/lib/api/github';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const TEMPLATE_OWNER = 'Fabriziochiappini';
const TEMPLATE_REPO = 'lander-template';

async function main() {
    try {
        console.log('Pushing sitemap.ts...');
        const sitemapContent = fs.readFileSync(path.join(__dirname, '../templates/next-magazine/app/sitemap.ts'), 'utf8');
        await github.commitFile(
            TEMPLATE_OWNER,
            TEMPLATE_REPO,
            'app/sitemap.ts',
            sitemapContent,
            'feat: add dynamic sitemap for SEO coverage'
        );
        console.log('sitemap.ts pushed successfully.');

        console.log('Pushing robots.ts...');
        const robotsContent = fs.readFileSync(path.join(__dirname, '../templates/next-magazine/app/robots.ts'), 'utf8');
        await github.commitFile(
            TEMPLATE_OWNER,
            TEMPLATE_REPO,
            'app/robots.ts',
            robotsContent,
            'feat: add dynamic robots.txt'
        );
        console.log('robots.ts pushed successfully.');

    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

main();
