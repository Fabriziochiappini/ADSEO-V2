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
        const result = await namecheap.checkAvailability(domain);

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
            available: result.available,
            error: result.error, // Pass error to frontend
            price: result.available ? 10.00 : 0,
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
