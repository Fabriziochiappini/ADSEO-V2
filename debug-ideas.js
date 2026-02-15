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
        const seeds = ["traslochi roma"];

        console.log('Testing keyword_ideas with:', seeds);

        // Parametry variations to test
        const payloads = [
            {
                name: "Standard: Loc 2380 (Italy), Lang 'it'",
                body: {
                    keywords: seeds,
                    location_code: 2380,
                    language_code: "it",
                    include_seed_keyword: true,
                    limit: 10
                }
            },
            {
                name: "No Location Code",
                body: {
                    keywords: seeds,
                    language_code: "it",
                    include_seed_keyword: true,
                    limit: 10
                }
            },
            {
                name: "Broad Match (No location, no lang)",
                body: {
                    keywords: seeds,
                    limit: 10
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
                continue;
            }

            const data = await response.json();
            const result = data.tasks?.[0]?.result;
            console.log('Results count:', result ? result.length : 0);
            if (result && result.length > 0) {
                console.log('Sample:', result[0].keyword, result[0].keyword_info?.search_volume);
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
