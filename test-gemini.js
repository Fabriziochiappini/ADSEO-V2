import { AiService } from './src/lib/api/gemini.ts';
import fs from 'fs';

async function run() {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const match = envContent.match(/GEMINI_API_KEY=(.*)/);
  if(!match) throw new Error("No key");
  const key = match[1].trim();
  const ai = new AiService(key);
  try {
    const res = await ai.generateLandingPageContent('personaltrainerai.org', 'app personal trainer ai palestra');
    console.log("SUCCESS:", res);
  } catch (e) {
    console.error("FAILED:", e);
  }
}
run();
