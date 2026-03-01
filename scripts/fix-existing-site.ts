import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        const repoSearch = 'viterbo';
        console.log(`Searching for repos matching: ${repoSearch}`);
        
        // This is a bit manual but let's try to list some repos
        // Or better, let's just use the name the user gave potentially
        const targetRepo = 'adseo-bellaviterbo-it'; // Prova con questo formato standard che ho visto prima
        
        console.log(`--- FIXING SITE: ${targetRepo} ---`);
        
        const componentDir = path.join(__dirname, '../templates/next-magazine/components');
        const files = fs.readdirSync(componentDir);

        for (const filename of files) {
            const localPath = path.join(componentDir, filename);
            if (fs.lstatSync(localPath).isFile()) {
                const content = fs.readFileSync(localPath, 'utf8');
                await github.commitFile(USERNAME, targetRepo, `components/${filename}`, content, `fix: restore missing component ${filename}`);
                console.log(`OK: components/${filename} pushato su ${targetRepo}`);
            }
        }

        // Push layout.tsx and constants.ts if needed
        const layoutFile = path.join(__dirname, '../templates/next-magazine/app/layout.tsx');
        if (fs.existsSync(layoutFile)) {
             const content = fs.readFileSync(layoutFile, 'utf8');
             await github.commitFile(USERNAME, targetRepo, `app/layout.tsx`, content, `fix: resolve GoogleAnalytics import`);
             console.log(`OK: app/layout.tsx pushato su ${targetRepo}`);
        }

        console.log(`--- Fix per ${targetRepo} completato ---`);

    } catch (err: any) {
        console.error('ERRORE DURANTE IL FIX:', err.message);
    }
}

main();
