import dotenv from 'dotenv';
import { AiService } from './src/lib/api/gemini.js';

dotenv.config({ path: '.env.local' });

async function run() {
  const gemini = new AiService(process.env.GEMINI_API_KEY);
  console.log('Testing generateLongFormArticle for failed keyword...');
  try {
    const res = await gemini.generateLongFormArticle('ideazione logo aziendale Frosinone');
    console.log('Success:', res.title);
  } catch (e) {
    console.log('Error generating article:', e.message);
  }
}

// Just compile Typescript first or use ts-node
