import { NextResponse } from 'next/server';
import { vercel } from '@/lib/api/vercel';
import { namecheap } from '@/lib/api/namecheap';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { domain, topic } = body;

        if (!domain || !topic) {
            return NextResponse.json({ error: 'Domain and Topic are required' }, { status: 400 });
        }

        // 1. Create Vercel Project
        // Normalize project name: lowercase, replace spaces with dashes, remove special chars
        const projectName = `adseo-${topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

        console.log(`Creating Vercel project: ${projectName}...`);
        const project = await vercel.createProject(projectName);
        const projectId = project.id;
        console.log(`Project created. ID: ${projectId}`);

        // 2. Purchase & Configure DNS (Namecheap) - Resilience Wrapper
        let domainStatus = 'skipped';
        if (process.env.NAMECHEAP_USER) {
            console.log(`Attempting purchase/DNS for ${domain}...`);
            try {
                // await namecheap.registerDomain(domain); // Still commented out for safety
                const dnsSuccess = await namecheap.setVercelDNS(domain);
                domainStatus = dnsSuccess ? 'configured' : 'failed_dns';
            } catch (ncError) {
                console.error('Namecheap automation failed (expected on Vercel without static IP):', ncError);
                domainStatus = 'failed_ip_or_auth';
            }
        }

        // 3. Add Domain to Project
        console.log(`Assigning domain ${domain} to project...`);
        // Note: This might fail if the domain is not verified or owned yet, 
        // but Vercel allows adding it pending verification.
        const domainData = await vercel.addDomain(projectId, domain);

        return NextResponse.json({
            success: true,
            projectName: project.name,
            projectUrl: `https://${project.name}.vercel.app`,
            dashboardUrl: `https://vercel.com/${project.accountId || 'dashboard'}/${project.name}`,
            domainConfig: domainData,
            // Instructions for the user regarding DNS
            dnsInstructions: {
                type: 'A',
                name: '@',
                value: '76.76.21.21'
            }
        });

    } catch (error: any) {
        console.error('Deploy error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to deploy project' },
            { status: 500 }
        );
    }
}
