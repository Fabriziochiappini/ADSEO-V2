import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const url = 'https://adseo-v2.vercel.app/api/cron/drip-feed';
  
  console.log('Testing', url);
  try {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'vercel-cron/1.0'
        }
    });
    const text = await res.text();
    console.log(`Response ${res.status}: ${text}`);
  } catch (e) {
    console.log('Error', e.message);
  }
}

run();
