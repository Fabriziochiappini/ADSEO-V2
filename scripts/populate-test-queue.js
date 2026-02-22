#!/usr/bin/env node

/**
 * Script per popolare la coda con articoli di test
 * Usage: node scripts/populate-test-queue.js [num_articles] [campaign_id]
 */

const { supabase } = require('../src/lib/supabase');

const NUM_ARTICLES = parseInt(process.argv[2]) || 5;
const CAMPAIGN_ID = process.argv[3] || 'test-campaign-123';

// Keywords di test realistiche
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

async function populateTestQueue() {
    console.log(`📝 Populating test queue with ${NUM_ARTICLES} articles...`);
    
    const articles = [];
    
    for (let i = 0; i < NUM_ARTICLES; i++) {
        const keyword = TEST_KEYWORDS[i % TEST_KEYWORDS.length];
        const scheduledAt = new Date();
        // Schedula articoli ogni 10 minuti per test rapidi
        scheduledAt.setMinutes(scheduledAt.getMinutes() + (i * 10));
        
        articles.push({
            campaign_id: CAMPAIGN_ID,
            keyword: `${keyword} ${i + 1}`,
            status: 'pending',
            scheduled_at: scheduledAt.toISOString(),
            created_at: new Date().toISOString()
        });
    }
    
    try {
        // Inserisci articoli in batch
        const { data, error } = await supabase
            .from('article_queue')
            .insert(articles);
            
        if (error) {
            console.error('❌ Error inserting articles:', error);
            return;
        }
        
        console.log(`✅ Successfully inserted ${NUM_ARTICLES} test articles`);
        console.log('\n📋 Test articles scheduled at:');
        articles.forEach((article, index) => {
            console.log(`${index + 1}. "${article.keyword}" - ${new Date(article.scheduled_at).toLocaleString()}`);
        });
        
        console.log('\n🚀 You can now run:');
        console.log('   npm run test:drip-feed     # to test immediately');
        console.log('   npm run test:drip-loop     # to test every 5 minutes');
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

populateTestQueue();