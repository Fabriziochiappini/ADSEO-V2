#!/usr/bin/env node

/**
 * Script per testare il drip-feed ogni 5 minuti
 * Usage: node scripts/test-drip-feed.js [interval_minutes]
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_INTERVAL = parseInt(process.argv[2]) || 5; // minuti

async function testDripFeed() {
    try {
        console.log(`[${new Date().toISOString()}] Testing drip feed...`);
        
        const response = await fetch(`${BASE_URL}/api/cron/trigger-test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Success: ${data.message}`);
            if (data.title) {
                console.log(`📄 Article title: ${data.title}`);
            }
        } else {
            console.log(`❌ Error: ${data.error}`);
        }
        
        console.log('---');
        
    } catch (error) {
        console.error(`❌ Network error: ${error.message}`);
        console.log('---');
    }
}

async function runTests() {
    console.log(`🚀 Starting drip feed test runner (interval: ${TEST_INTERVAL} minutes)`);
    console.log(`Base URL: ${BASE_URL}`);
    console.log('Press Ctrl+C to stop\n');
    
    // Test immediato
    await testDripFeed();
    
    // Poi ogni X minuti
    setInterval(testDripFeed, TEST_INTERVAL * 60 * 1000);
}

// Gestione errori
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

runTests().catch(console.error);