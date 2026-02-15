'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Loader2, Rocket, Layout, ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react';

interface SiteContent {
    domain: string;
    keyword: string;
    brandName: string;
    heroTitle: string;
    heroSubtitle: string;
    serviceDescription: string;
    ctaText: string;
    status: 'pending' | 'generating' | 'ready' | 'error' | 'deploying' | 'deployed';
    deploymentUrl?: string;
    errorMessage?: string;
}

interface ContentSetupProps {
    selectedDomains: string[];
    keywords: any[];
    campaignId: string;
    onBack: () => void;
}

export default function ContentSetup({ selectedDomains, keywords, campaignId, onBack }: ContentSetupProps) {
    const [sites, setSites] = useState<SiteContent[]>([]);
    const [isLaunching, setIsLaunching] = useState(false);

    useEffect(() => {
        // Initialize sites based on selected domains
        const initialSites = selectedDomains.map(domain => {
            const keywordObj = keywords[Math.floor(Math.random() * Math.min(10, keywords.length))];
            return {
                domain,
                keyword: keywordObj.keyword,
                brandName: '',
                brandTagline: '',
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
            if (updatedSites[i].status === 'ready' || updatedSites[i].status === 'deployed') continue;

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

        // Mark all as deploying
        setSites(prev => prev.map(s => ({ ...s, status: s.status === 'ready' ? 'deploying' : s.status })));

        try {
            const res = await fetch('/api/campaign/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: campaignId,
                    sites: sites.filter(s => s.status === 'ready' || s.status === 'deploying')
                })
            });

            const data = await res.json();

            if (data.results) {
                setSites(prev => prev.map(s => {
                    const result = data.results.find((r: any) => r.domain === s.domain);
                    if (result) {
                        return {
                            ...s,
                            status: result.status === 'deployed' ? 'deployed' : 'error',
                            deploymentUrl: result.url,
                            errorMessage: result.error
                        };
                    }
                    return s;
                }));
            }
        } catch (err) {
            console.error('Launch failed:', err);
            alert('Global deployment failed. Check logs.');
        } finally {
            setIsLaunching(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        disabled={isLaunching}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30"
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
                    disabled={sites.some(s => s.status === 'generating') || isLaunching}
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
                        className={`bg-slate-900/50 border rounded-2xl overflow-hidden transition-colors ${site.status === 'deployed' ? 'border-green-500/50 bg-green-950/5' :
                            site.status === 'error' ? 'border-red-500/50 bg-red-950/5' :
                                'border-slate-800'
                            }`}
                    >
                        <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${site.status === 'deployed' ? 'bg-green-500/10 border-green-500/20' : 'bg-indigo-500/10 border-indigo-500/20'
                                    }`}>
                                    <Layout className={`w-4 h-4 ${site.status === 'deployed' ? 'text-green-400' : 'text-indigo-400'}`} />
                                </div>
                                <span className={`font-mono text-sm font-semibold ${site.status === 'deployed' ? 'text-green-400' : 'text-indigo-400'}`}>
                                    {site.domain}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {site.status === 'deployed' && (
                                    <a
                                        href={site.deploymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-green-400 hover:underline"
                                    >
                                        <ExternalLink className="w-3 h-3" /> Dashboard
                                    </a>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Target:</span>
                                    <span className="text-xs font-medium text-slate-300 px-2 py-1 bg-slate-800 rounded-md">
                                        {site.keyword}
                                    </span>
                                </div>
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
                            ) : (site.status === 'generating' || site.status === 'deploying') ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                                    <p className="text-slate-400 text-sm">
                                        {site.status === 'generating' ? 'AI is writing your landing page...' : 'Provisioning on Vercel...'}
                                    </p>
                                </div>
                            ) : site.status === 'error' ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                                    <p className="text-red-400 text-sm font-medium">Deployment Failed</p>
                                    <p className="text-slate-500 text-xs mt-1">{site.errorMessage || 'Unknown error'}</p>
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
                                            <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold text-white ${site.status === 'deployed' ? 'bg-green-600' : 'bg-indigo-600'
                                                }`}>
                                                {site.status === 'deployed' ? <Check className="w-4 h-4 mr-2" /> : null}
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
                    disabled={sites.some(s => s.status !== 'ready') || isLaunching || sites.every(s => s.status === 'deployed')}
                    className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-12 py-4 rounded-2xl font-black text-xl shadow-2xl shadow-blue-900/40 transition-all disabled:opacity-30 disabled:grayscale"
                >
                    {isLaunching ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <Rocket className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    )}
                    {sites.every(s => s.status === 'deployed') ? 'ALL CAMPAIGNS LIVE!' : 'LAUNCH ALL CAMPAIGNS'}
                </button>
                <p className="mt-4 text-slate-500 text-sm">
                    {sites.every(s => s.status === 'deployed')
                        ? 'Projects created and domains assigned. Check your email/Vercel dashboard.'
                        : 'This will create Projects on Vercel and assign domains via Namecheap.'
                    }
                </p>
            </div>
        </div>
    );
}
