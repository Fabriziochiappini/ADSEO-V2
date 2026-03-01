import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const TEMPLATE_REPO = 'lander-template';

const github = new GithubService(TOKEN, USERNAME);

async function main() {
    try {
        console.log('--- FIX: Pushing missing components to Master Template ---');
        
        const componentDir = path.join(__dirname, '../templates/next-magazine/components');
        const files = fs.readdirSync(componentDir);

        for (const filename of files) {
            const localPath = path.join(componentDir, filename);
            if (fs.lstatSync(localPath).isFile()) {
                console.log(`Pushing components/${filename}...`);
                const content = fs.readFileSync(localPath, 'utf8');
                await github.commitFile(USERNAME, TEMPLATE_REPO, `components/${filename}`, content, `fix: add/update ${filename}`);
                console.log(`OK: ${filename} pushato.`);
            }
        }

        // Push also the types file just in case
        const typeFile = path.join(__dirname, '../templates/next-magazine/lib/types.ts');
        if (fs.existsSync(typeFile)) {
             console.log(`Pushing lib/types.ts...`);
             const content = fs.readFileSync(typeFile, 'utf8');
             await github.commitFile(USERNAME, TEMPLATE_REPO, `lib/types.ts`, content, `fix: add/update types.ts`);
             console.log(`OK: types.ts pushato.`);
        }

        console.log('--- Components Allineati ---');

    } catch (err: any) {
        console.error('ERRORE PUSH COMPONENTI:', err.message);
    }
}

main();
