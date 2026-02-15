const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) env[key.trim()] = value.trim();
        });

        const auth = Buffer.from(`${env.DATAFORSEO_USERNAME}:${env.DATAFORSEO_PASSWORD}`).toString('base64');
        const seed = "traslochi roma";
        console.log('Testing related_keywords with seed:', seed);

        // Endpoint: related_keywords
        // https://docs.dataforseo.com/v3/keywords_data/google/related_keywords/live

        const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google/related_keywords/live', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{
                keyword: seed,
                location_code: 2380,
                language_code: "it",
                depth: 1,
                limit: 10
            }])
        });

        if (!response.ok) {
            console.log('Error:', response.status);
            const err = await response.text();
            console.log(err);
            return;
        }

        const data = await response.json();
        const result = data.tasks?.[0]?.result;
        console.log('Results count:', result ? result.items?.length : 0); // result is object with items array

        if (result && result.items && result.items.length > 0) {
            console.log('First 5 items:');
            result.items.slice(0, 5).forEach(r => console.log(`- ${r.keyword_data?.keyword} (Vol: ${r.keyword_data?.keyword_info?.search_volume})`));
        } else {
            console.log('Full Result Object:', JSON.stringify(result, null, 2));
            if (data.tasks?.[0]?.status_message) {
                console.log('Status Message:', data.tasks[0].status_message);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

run();
