import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const TEMPLATE_REPO = 'lander-template';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log('--- Push iniziata: Ottimizzazione SEO Avanzata ---');
        
        const pageHomePath = path.join(__dirname, '../templates/next-magazine/app/page.tsx');
        const pageArticlePath = path.join(__dirname, '../templates/next-magazine/app/article/[slug]/page.tsx');

        // Pusho le modifiche a page.tsx e [slug]/page.tsx che contengono i nuovi metadati dinamici e JSON-LD
        const files = [
            { path: 'app/page.tsx', local: pageHomePath, msg: 'feat: add dynamic metadata and LocalBusiness schema to home' },
            { path: 'app/article/[slug]/page.tsx', local: pageArticlePath, msg: 'feat: add dynamic article metadata and Article schema' }
        ];

        for (const file of files) {
            console.log(`Pushing ${file.path}...`);
            const content = fs.readFileSync(file.local, 'utf8');
            await github.commitFile(USERNAME, TEMPLATE_REPO, file.path, content, file.msg);
            console.log(`OK: ${file.path} pushato.`);
        }

        console.log('--- Allineamento SEO completato con successo ---');

    } catch (err: any) {
        console.error('ERRORE DURANTE IL PUSH SEO:', err.message);
    }
}

main();
