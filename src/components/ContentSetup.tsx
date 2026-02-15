'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Check, Loader2, Rocket, Layout, ArrowLeft } from 'lucide-react';

interface SiteContent {
    domain: string;
    keyword: string;
    brandName: string;
    heroTitle: string;
    heroSubtitle: string;
    serviceDescription: string;
    ctaText: string;
    status: 'pending' | 'generating' | 'ready' | 'error';
}

interface ContentSetupProps {
    selectedDomains: string[];
    keywords: any[];
    onBack: () => void;
}

export default function ContentSetup({ selectedDomains, keywords, onBack }: ContentSetupProps) {
    const [sites, setSites] = useState<SiteContent[]>([]);
    const [isLaunching, setIsLaunching] = useState(false);

    useEffect(() => {
        // Initialize sites based on selected domains
        const initialSites = selectedDomains.map(domain => {
            // Find a relevant keyword for this domain (simplification: pick one by index or random)
            const keywordObj = keywords[Math.floor(Math.random() * Math.min(10, keywords.length))];
            return {
                domain,
                keyword: keywordObj.keyword,
                brandName: '',
                heroTitle: '',
                heroSubtitle: '',
                serviceDescription: '',
                ctaText: '',
                status: 'pending' as const
            };
        });
        setSites(initialSites);
    }, [selectedDomains, keywords]);

    const generateAllContent = async () => {
        const updatedSites = [...sites];

        for (let i = 0; i < updatedSites.length; i++) {
            updatedSites[i].status = 'generating';
            setSites([...updatedSites]);

            try {
                const res = await fetch('/api/content/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        domain: updatedSites[i].domain,
                        keyword: updatedSites[i].keyword
                    })
                });
                const data = await res.json();

                updatedSites[i] = {
                    ...updatedSites[i],
                    ...data,
                    status: 'ready'
                };
                setSites([...updatedSites]);
            } catch (err) {
                updatedSites[i].status = 'error';
                setSites([...updatedSites]);
            }
        }
    };

    const handleLaunch = async () => {
        setIsLaunching(true);
        // TODO: Implement actual deployment logic call
        setTimeout(() => {
            alert('Launching deployment for all sites... Check Vercel Dashboard!');
            setIsLaunching(false);
        }, 2000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Content Setup</h2>
                        <p className="text-slate-400">Review and customize AI-generated content for your sites.</p>
                    </div>
                </div>

                <button
                    onClick={generateAllContent}
                    disabled={sites.some(s => s.status === 'generating')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                    <Loader2 className={`w-4 h-4 ${sites.some(s => s.status === 'generating') ? 'animate-spin' : 'hidden'}`} />
                    Auto-Generate All
                </button>
            </div>

            <div className="space-y-6">
                {sites.map((site, idx) => (
                    <motion.div
                        key={site.domain}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden"
                    >
                        <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <Layout className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="font-mono text-indigo-400 text-sm font-semibold">{site.domain}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Target Keyword:</span>
                                <span className="text-xs font-medium text-slate-300 px-2 py-1 bg-slate-800 rounded-md">
                                    {site.keyword}
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            {site.status === 'pending' ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                        <Edit3 className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 text-sm">Waiting to generate content...</p>
                                </div>
                            ) : site.status === 'generating' ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                                    <p className="text-slate-400 text-sm">AI is writing your landing page...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">Brand Name</label>
                                            <p className="text-white font-semibold text-lg">{site.brandName}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">Hero Title</label>
                                            <p className="text-slate-200 text-xl font-bold leading-tight">{site.heroTitle}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">Hero Subtitle</label>
                                            <p className="text-slate-400 text-sm">{site.heroSubtitle}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">Service Description</label>
                                            <p className="text-slate-300 text-sm italic border-l-2 border-indigo-500 pl-4 py-1">
                                                "{site.serviceDescription}"
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">Primary CTA</label>
                                            <div className="inline-flex items-center px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold text-white">
                                                {site.ctaText}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 flex flex-col items-center">
                <button
                    onClick={handleLaunch}
                    disabled={sites.some(s => s.status !== 'ready') || isLaunching}
                    className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-12 py-4 rounded-2xl font-black text-xl shadow-2xl shadow-blue-900/40 transition-all disabled:opacity-30 disabled:grayscale"
                >
                    {isLaunching ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <Rocket className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    )}
                    LAUNCH ALL CAMPAIGNS
                </button>
                <p className="mt-4 text-slate-500 text-sm">
                    This will create Projects on Vercel and assign domains via Namecheap.
                </p>
            </div>
        </div>
    );
}
