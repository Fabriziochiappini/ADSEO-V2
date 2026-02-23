
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSites() {
    const { data, error } = await supabase.from('sites').select('*').limit(1);
    if (error) {
        console.log('Error accessing sites table:', error.message);
    } else {
        console.log('Sites table exists!', data);
    }
}

checkSites();
