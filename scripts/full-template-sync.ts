import { GithubService } from '../src/lib/api/github';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = 'Fabriziochiappini';
const REPOS = ['lander-template', 'adseo-bellaviterbo-online'];

const github = new GithubService(TOKEN, USERNAME);

async function getDirectoryFiles(localDir: string, remoteDir: string, files: { path: string, content: string }[] = []) {
    const items = fs.readdirSync(localDir);
    for (const item of items) {
        if (item === '.next' || item === 'node_modules') continue;
        const localPath = path.join(localDir, item);
        const remotePath = path.join(remoteDir, item);

        if (fs.lstatSync(localPath).isDirectory()) {
            await getDirectoryFiles(localPath, remotePath, files);
        } else {
            const content = fs.readFileSync(localPath, 'utf8');
            files.push({ path: remotePath, content });
        }
    }
    return files;
}

async function main() {
    try {
        for (const repo of REPOS) {
            console.log(`--- ATOMIC SYNC FOR: ${repo} ---`);
            const allFiles: { path: string, content: string }[] = [];

            // Collect from app, components, lib
            await getDirectoryFiles(path.join(__dirname, '../templates/next-magazine/app'), 'app', allFiles);
            await getDirectoryFiles(path.join(__dirname, '../templates/next-magazine/components'), 'components', allFiles);
            await getDirectoryFiles(path.join(__dirname, '../templates/next-magazine/lib'), 'lib', allFiles);

            // Collect core files
            const coreFiles = ['package.json', 'next.config.js', 'tailwind.config.js', 'postcss.config.js', 'tsconfig.json', 'types.ts', 'index.tsx'];
            for (const file of coreFiles) {
                const localPath = path.join(__dirname, '../templates/next-magazine', file);
                if (fs.existsSync(localPath)) {
                    allFiles.push({ path: file, content: fs.readFileSync(localPath, 'utf8') });
                }
            }

            // Single atomic commit
            if (allFiles.length > 0) {
                await github.commitFiles(USERNAME, repo, allFiles, 'chore: full template update (atomic)');
            }

            console.log(`--- Atomic Sync for ${repo} completed ---`);
        }
    } catch (err: any) {
        console.error('SYNC ERROR:', err.message);
    }
}

main();
