import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const TARGET_REPO = 'adseo-bellaviterbo-online';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log(`--- V2 FIX FOR EXISTING SITE: ${TARGET_REPO} ---`);
        
        const filesToPush = [
            { path: 'app/layout.tsx', local: path.join(__dirname, '../templates/next-magazine/app/layout.tsx'), msg: 'fix: clean colors, remove typos and refine footer' },
            { path: 'app/article/[slug]/page.tsx', local: path.join(__dirname, '../templates/next-magazine/app/article/[slug]/page.tsx'), msg: 'feat: add related articles and youtube to article page, remove generic text' }
        ];

        for (const file of filesToPush) {
            console.log(`Pushing ${file.path} to ${TARGET_REPO}...`);
            const content = fs.readFileSync(file.local, 'utf8');
            await github.commitFile(USERNAME, TARGET_REPO, file.path, content, file.msg);
        }

        console.log(`--- Fix V2 per ${TARGET_REPO} completato ---`);

    } catch (err: any) {
        console.error('ERRORE:', err.message);
    }
}

main();
