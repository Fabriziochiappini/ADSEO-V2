import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const TARGET_REPO = 'adseo-bellaviterbo-online';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log(`--- FIXING EXISTING SITE: ${TARGET_REPO} ---`);
        
        // 1. Push missing components
        const componentDir = path.join(__dirname, '../templates/next-magazine/components');
        const files = fs.readdirSync(componentDir);

        for (const filename of files) {
            const localPath = path.join(componentDir, filename);
            if (fs.lstatSync(localPath).isFile()) {
                console.log(`Pushing components/${filename}...`);
                const content = fs.readFileSync(localPath, 'utf8');
                await github.commitFile(USERNAME, TARGET_REPO, `components/${filename}`, content, `fix: add missing component ${filename}`);
            }
        }

        // 2. Push fixed layout.tsx
        const layoutFile = path.join(__dirname, '../templates/next-magazine/app/layout.tsx');
        if (fs.existsSync(layoutFile)) {
             console.log(`Pushing app/layout.tsx...`);
             const content = fs.readFileSync(layoutFile, 'utf8');
             await github.commitFile(USERNAME, TARGET_REPO, `app/layout.tsx`, content, `fix: resolve GoogleAnalytics import and update colors`);
        }

        // 3. Push constants.ts just to be sure
        const constantsFile = path.join(__dirname, '../templates/next-magazine/lib/constants.ts');
        if (fs.existsSync(constantsFile)) {
             console.log(`Pushing lib/constants.ts...`);
             const content = fs.readFileSync(constantsFile, 'utf8');
             await github.commitFile(USERNAME, TARGET_REPO, `lib/constants.ts`, content, `fix: ensure constants are updated`);
        }

        console.log(`--- Fix per ${TARGET_REPO} completato con successo ---`);

    } catch (err: any) {
        console.error('ERRORE DURANTE IL FIX:', err.message);
    }
}

main();
