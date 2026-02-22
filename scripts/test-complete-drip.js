#!/usr/bin/env node

/**
 * Script completo per testare il drip-feed
 * Usage: node scripts/test-complete-drip.js [options]
 * 
 * Options:
 *   --populate N     Popola coda con N articoli
 *   --force          Forza pubblicazione anche se scheduled_at è nel futuro
 *   --loop N         Loop ogni N minuti (default: 5)
 *   --limit N        Processa max N articoli per volta
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

function parseArgs() {
    const args = {
        populate: 0,
        force: false,
        loop: 0,
        limit: 5
    };
    
    for (let i = 2; i < process.argv.length; i++) {
        switch (process.argv[i]) {
            case '--populate':
                args.populate = parseInt(process.argv[++i]) || 5;
                break;
            case '--force':
                args.force = true;
                break;
            case '--loop':
                args.loop = parseInt(process.argv[++i]) || 5;
                break;
            case '--limit':
                args.limit = parseInt(process.argv[++i]) || 5;
                break;
        }
    }
    
    return args;
}

async function populateQueue(count) {
    console.log(`📝 Populating queue with ${count} test articles...`);
    
    const TEST_KEYWORDS = [
        'digital marketing strategies',
        'SEO optimization tips', 
        'content marketing trends',
        'social media engagement',
        'email marketing best practices',
        'website conversion optimization',
        'mobile marketing techniques',
        'brand awareness campaigns',
        'customer retention strategies',
        'influencer marketing ROI'
    ];
    
    const articles = [];
    for (let i = 0; i < count; i++) {
        const keyword = TEST_KEYWORDS[i % TEST_KEYWORDS.length];
        const scheduledAt = new Date();
        // Schedula articoli ogni 2 minuti per test rapidi
        scheduledAt.setMinutes(scheduledAt.getMinutes() + (i * 2));
        
        articles.push({
            campaign_id: 'test-campaign-123',
            keyword: `${keyword} ${i + 1}`,
            status: 'pending',
            scheduled_at: scheduledAt.toISOString(),
            created_at: new Date().toISOString()
        });
    }
    
    try {
        const response = await fetch(`${BASE_URL}/api/debug-db`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'insert_queue',
                articles: articles 
            })
        });
        
        if (response.ok) {
            console.log(`✅ Successfully populated queue with ${count} articles`);
        } else {
            console.log('❌ Failed to populate queue - trying direct approach');
            // Se il debug endpoint non esiste, usa il metodo diretto
            for (const article of articles) {
                await fetch(`${BASE_URL}/api/debug-db`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: 'insert_queue_single',
                        article: article 
                    })
                });
            }
        }
    } catch (error) {
        console.log('❌ Error populating queue:', error.message);
    }
}

async function forceDrip(force, limit) {
    console.log(`🚀 Testing force drip (force: ${force}, limit: ${limit})...`);
    
    try {
        const response = await fetch(`${BASE_URL}/api/cron/force-drip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ force, limit })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Success: ${data.message}`);
            if (data.results) {
                console.log(`📊 Processed: ${data.results.processed}, Failed: ${data.results.failed}`);
                if (data.results.articles && data.results.articles.length > 0) {
                    console.log('📄 Articles:');
                    data.results.articles.forEach(article => {
                        console.log(`   - ${article.title}`);
                    });
                }
            }
        } else {
            console.log(`❌ Error: ${data.error}`);
        }
    } catch (error) {
        console.error(`❌ Network error: ${error.message}`);
    }
}

async function testRegularDrip() {
    console.log(`🔍 Testing regular drip feed...`);
    
    try {
        const response = await fetch(`${BASE_URL}/api/cron/trigger-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Success: ${data.message}`);
            if (data.title) {
                console.log(`📄 Article: ${data.title}`);
            }
        } else {
            console.log(`❌ Error: ${data.error}`);
        }
    } catch (error) {
        console.error(`❌ Network error: ${error.message}`);
    }
}

async function runTests() {
    const args = parseArgs();
    
    console.log('🎯 ADSEO Drip Feed Test Suite');
    console.log(`Base URL: ${BASE_URL}`);
    console.log('---\n');
    
    // Popola coda se richiesto
    if (args.populate > 0) {
        await populateQueue(args.populate);
        console.log('');
    }
    
    // Test iniziale
    if (args.force) {
        await forceDrip(args.force, args.limit);
    } else {
        await testRegularDrip();
    }
    console.log('');
    
    // Loop se richiesto
    if (args.loop > 0) {
        console.log(`🔄 Starting loop mode (every ${args.loop} minutes)...`);
        console.log('Press Ctrl+C to stop\n');
        
        setInterval(async () => {
            console.log(`[${new Date().toISOString()}] Running scheduled test...`);
            if (args.force) {
                await forceDrip(args.force, args.limit);
            } else {
                await testRegularDrip();
            }
            console.log('---');
        }, args.loop * 60 * 1000);
    } else {
        console.log('✅ Test completed');
        process.exit(0);
    }
}

// Gestione errori
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

runTests().catch(console.error);