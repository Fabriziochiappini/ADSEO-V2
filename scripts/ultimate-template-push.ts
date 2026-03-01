import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const TEMPLATE_REPO = 'lander-template';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log('--- ULTIMATE PUSH: Master Template Full Refinement ---');
        
        const filesToPush = [
            { path: 'app/layout.tsx', local: path.join(__dirname, '../templates/next-magazine/app/layout.tsx'), msg: 'fix: clean colors, remove typos and refine footer' },
            { path: 'app/page.tsx', local: path.join(__dirname, '../templates/next-magazine/app/page.tsx'), msg: 'fix: home refinement' },
            { path: 'app/article/[slug]/page.tsx', local: path.join(__dirname, '../templates/next-magazine/app/article/[slug]/page.tsx'), msg: 'feat: add related articles and youtube to article page, remove generic text' },
            { path: 'lib/constants.ts', local: path.join(__dirname, '../templates/next-magazine/lib/constants.ts'), msg: 'fix: constants sync' },
            { path: 'components/ArticleGrid.tsx', local: path.join(__dirname, '../templates/next-magazine/components/ArticleGrid.tsx'), msg: 'fix: article grid styling' }
        ];

        for (const file of filesToPush) {
            if (fs.existsSync(file.local)) {
                console.log(`Pushing ${file.path}...`);
                const content = fs.readFileSync(file.local, 'utf8');
                await github.commitFile(USERNAME, TEMPLATE_REPO, file.path, content, file.msg);
                console.log(`OK: ${file.path} pushato.`);
            }
        }

        console.log('--- Master Template Aggiornato al 100% ---');

    } catch (err: any) {
        console.error('ERRORE PUSH:', err.message);
    }
}

main();
