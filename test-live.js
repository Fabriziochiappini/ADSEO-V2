import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  console.log("CRON_SECRET exists:", !!process.env.CRON_SECRET);
  if (!process.env.CRON_SECRET) {
      console.log('No CRON_SECRET, cant test live correctly.');
      // return;
  }
  
  const urls = [
      'https://adseo-v2.vercel.app/api/cron/drip-feed',
      'https://studiopisciavino.com/api/cron/drip-feed'
  ];
  
  for (const u of urls) {
      console.log('Testing', u);
      try {
        const res = await fetch(u, {
            headers: {
                'Authorization': `Bearer ${process.env.CRON_SECRET}`,
                'User-Agent': 'vercel-cron/1.0'
            }
        });
        const text = await res.text();
        console.log(`Response ${res.status}: ${text}`);
      } catch (e) {
        console.log('Error', e.message);
      }
  }
}

run();
