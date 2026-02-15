import { NextResponse } from 'next/server';
import { namecheap } from '@/lib/api/namecheap';

export async function POST(req: Request) {
    try {
        const { domain } = await req.json();

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // Basic validation
        if (!domain.includes('.')) {
            return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
        }

        // Call Namecheap Service
        // Note: If creds are missing, this returns false or logs error
        const isAvailable = await namecheap.checkAvailability(domain);

        // Mock response for dev if no keys provided yet
        if (!process.env.NAMECHEAP_USER) {
            console.warn('Mocking domain availability (No API Key)');
            return NextResponse.json({
                domain,
                available: true,
                price: 9.98,
                currency: 'USD',
                mock: true
            });
        }

        return NextResponse.json({
            domain,
            available: isAvailable,
            // Price fetching would require a different command (domains.getList or similar), 
            // for "check" basic XML often just says "Available". 
            // We'll assume a standard price or implementing detailed pricing fetch later.
            price: isAvailable ? 10.00 : 0,
            currency: 'USD'
        });

    } catch (error) {
        console.error('Domain check error:', error);
        return NextResponse.json(
            { error: 'Failed to check domain' },
            { status: 500 }
        );
    }
}
