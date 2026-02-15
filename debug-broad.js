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

        // Strategy: Use VERY broad terms
        const seeds = ["traslochi", "sgomberi", "roma"];
        console.log('Testing keyword_ideas with BROAD seeds:', seeds);

        const payloads = [
            {
                name: "Broad Match - Just Keywords (No Loc/Lang/Limit)",
                body: {
                    keywords: seeds
                }
            },
            {
                name: "Broad Match - With Lang IT",
                body: {
                    keywords: seeds,
                    language_code: "it"
                }
            }
        ];

        for (const test of payloads) {
            console.log(`\n--- Test: ${test.name} ---`);
            const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google/keyword_ideas/live', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([test.body])
            });

            if (!response.ok) {
                console.log('Error:', response.status);
                const err = await response.text();
                console.log(err);
                continue;
            }

            const data = await response.json();
            const result = data.tasks?.[0]?.result;
            console.log('Results count:', result ? result.length : 0);

            if (result && result.length > 0) {
                console.log('First 5 items:');
                result.slice(0, 5).forEach(r => console.log(`- ${r.keyword} (Vol: ${r.keyword_info?.search_volume})`));
            } else {
                if (data.tasks?.[0]?.status_message) {
                    console.log('Status Message:', data.tasks[0].status_message);
                }
            }
        }

    } catch (e) {
        console.error(e);
    }
}

run();
