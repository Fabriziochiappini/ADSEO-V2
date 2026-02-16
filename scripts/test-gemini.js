// Simple Gemini API test - no imports needed
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
        const [k, ...rest] = line.split('=');
        if (k && rest.length) process.env[k.trim()] = rest.join('=').trim();
    }
}

const key = process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY present:', !!key);
console.log('GEMINI_API_KEY length:', key?.length);

if (!key) {
    console.error('ERROR: No GEMINI_API_KEY found!');
    process.exit(1);
}

const postData = JSON.stringify({
    contents: [{ parts: [{ text: 'Return ONLY a JSON object: {"brandName": "PizzaTop", "heroTitle": "Le Migliori Pizze di Frosinone"}' }] }],
    generationConfig: { responseMimeType: 'application/json' }
});

const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`);

const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('HTTP Status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error('API ERROR:', JSON.stringify(json.error, null, 2));
            } else if (json.candidates?.[0]?.content?.parts?.[0]?.text) {
                const text = json.candidates[0].content.parts[0].text;
                console.log('RAW AI RESPONSE:', text);
                const parsed = JSON.parse(text);
                console.log('PARSED:', JSON.stringify(parsed, null, 2));
                console.log('\n✅ SUCCESS! Gemini API is working correctly.');
            } else {
                console.log('UNEXPECTED RESPONSE:', data.substring(0, 500));
            }
        } catch (e) {
            console.error('PARSE ERROR:', e.message);
            console.log('RAW:', data.substring(0, 500));
        }
    });
});

req.on('error', e => console.error('REQUEST ERROR:', e.message));
req.write(postData);
req.end();
