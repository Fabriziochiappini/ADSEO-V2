import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const key = process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY present:', !!key);
console.log('GEMINI_API_KEY length:', key?.length);

if (!key) {
    console.error('ERROR: No GEMINI_API_KEY found!');
    process.exit(1);
}

// Test the API directly with fetch (Node 18+)
async function test() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Return ONLY a JSON object: {"brandName": "PizzaTop", "heroTitle": "Le Migliori Pizze di Frosinone"}' }] }],
                generationConfig: { responseMimeType: 'application/json' }
            })
        });

        console.log('HTTP Status:', res.status);
        const data = await res.json();

        if (data.error) {
            console.error('API ERROR:', JSON.stringify(data.error, null, 2));
        } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            console.log('RAW AI RESPONSE:', text);
            const parsed = JSON.parse(text);
            console.log('PARSED:', JSON.stringify(parsed, null, 2));
            console.log('\n✅ SUCCESS! Gemini API is working correctly.');
        } else {
            console.log('UNEXPECTED RESPONSE:', JSON.stringify(data).substring(0, 500));
        }
    } catch (err) {
        console.error('FETCH ERROR:', err.message);
    }
}

test();
