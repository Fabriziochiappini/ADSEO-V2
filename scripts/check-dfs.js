require('dotenv').config({ path: '.env.local' });
const https = require('https');

const username = process.env.DATAFORSEO_USERNAME;
const password = process.env.DATAFORSEO_PASSWORD;

if (!username || !password) {
    console.error('Error: DATAFORSEO_USERNAME or DATAFORSEO_PASSWORD not set in .env.local');
    process.exit(1);
}

const auth = Buffer.from(`${username}:${password}`).toString('base64');

// 1. Check User Balance
const userOptions = {
    hostname: 'api.dataforseo.com',
    path: '/v3/appendix/user_data',
    method: 'GET',
    headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(userOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.tasks && json.tasks[0] && json.tasks[0].result) {
                const result = json.tasks[0].result[0];
                console.log('\n--- DataForSEO Status ---');
                console.log(`User: ${result.login}`);
                console.log(`Balance: $${result.money}`);
                console.log(`Status: ${json.status_message}`);
                
                if (parseFloat(result.money) < 1.0) {
                    console.warn('WARNING: Low balance! Add funds to ensure keyword analysis works.');
                } else {
                    console.log('Balance looks good for analysis.');
                }
            } else {
                console.log('API Response:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error('Failed to parse response:', e);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
