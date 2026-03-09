import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: campaigns, error } = await supabase
            .from('campaigns')
            .select('*, sites(domain)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Flatten the sites.domain into the campaign object
        const formattedCampaigns = campaigns.map((campaign: any) => ({
            ...campaign,
            domain: campaign.sites?.[0]?.domain || null
        }));

        return new Response(JSON.stringify(formattedCampaigns), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}