import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import {
    BRAND_NAME,
    ABOUT_TITLE,
    ABOUT_INTRO,
    ABOUT_TEAM,
    ABOUT_CONCLUSION,
    ABOUT_META_DESCRIPTION,
    ABOUT_IMAGE_1,
    ABOUT_IMAGE_2,
    DOMAIN
} from '@/lib/constants';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
    title: ABOUT_TITLE,
    description: ABOUT_META_DESCRIPTION,
    alternates: {
        canonical: `${DOMAIN}/chi-siamo`,
    },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <Breadcrumbs items={[]} />

                <header className="mb-20 mt-12">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-8 leading-[1.1]">
                        {ABOUT_TITLE}
                    </h1>
                    <div
                        className="text-xl md:text-2xl text-zinc-600 font-medium max-w-3xl leading-relaxed prose prose-zinc"
                        dangerouslySetInnerHTML={{ __html: ABOUT_INTRO }}
                    />
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                            src={ABOUT_IMAGE_1}
                            alt={`${BRAND_NAME} Team Work`}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div
                            className="text-lg text-zinc-700 leading-loose prose prose-zinc max-w-none"
                            dangerouslySetInnerHTML={{ __html: ABOUT_TEAM }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <div
                            className="text-lg text-zinc-600 leading-relaxed prose prose-zinc max-w-none"
                            dangerouslySetInnerHTML={{ __html: ABOUT_CONCLUSION }}
                        />
                    </div>
                    <div className="order-1 md:order-2 relative aspect-video rounded-3xl overflow-hidden shadow-xl">
                        <Image
                            src={ABOUT_IMAGE_2}
                            alt={`${BRAND_NAME} Local Presence`}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
