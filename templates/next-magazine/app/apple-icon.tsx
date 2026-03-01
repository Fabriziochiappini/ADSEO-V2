import { ImageResponse } from 'next/og';
import { BRAND_NAME } from '@/lib/constants';

export const runtime = 'edge';

export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
    const initial = BRAND_NAME ? BRAND_NAME.charAt(0).toUpperCase() : 'A';

    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 120,
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    borderRadius: 40,
                }}
            >
                {initial}
            </div>
        ),
        {
            ...size,
        }
    );
}
