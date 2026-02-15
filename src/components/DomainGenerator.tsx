'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Search, Check, X, Loader2, Sparkles, Server } from 'lucide-react';

interface DomainGeneratorProps {
    topic: string;
    keywords: any[];
}

export default function DomainGenerator({ topic, keywords }: DomainGeneratorProps) {
    const [step, setStep] = useState<'select-count' | 'generating' | 'selection'>('select-count');
    const [siteCount, setSiteCount] = useState<number>(1);
    const [generatedDomains, setGeneratedDomains] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

    // 1. Generate Domains using AI
    const handleGenerate = async (count: number) => {
        setSiteCount(count);
        setStep('generating');
        setLoading(true);

        try {
            // Extract top keywords text for context
            const topKeywords = keywords.slice(0, 5).map(k => k.keyword);

            const res = await fetch('/api/domain/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, keywords: topKeywords })
            });

            const data = await res.json();

            // Initialize with 'unknown' status
            const initialDomains = data.domains.map((d: string) => ({
                name: d,
                available: null, // null = unchecked, true, false
                price: 0,
                error: null
            }));

            setGeneratedDomains(initialDomains);
            setStep('selection');

            checkAvailabilityBatch(initialDomains);

        } catch (err) {
            console.error(err);
            alert('Failed to generate domain ideas');
            setStep('select-count');
        } finally {
            setLoading(false);
        }
    };

    // 2. Check Availability (Batch or Single)
    const checkAvailabilityBatch = async (domains: any[]) => {
        const domainsToCheck = [...domains];

        for (let i = 0; i < domainsToCheck.length; i++) {
            try {
                const res = await fetch('/api/domain/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ domain: domainsToCheck[i].name })
                });
                const result = await res.json();

                // Update state item
                domainsToCheck[i].available = result.available;
                domainsToCheck[i].price = result.price;
                domainsToCheck[i].error = result.error;

                // Update UI incrementally
                setGeneratedDomains([...domainsToCheck]);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const toggleSelection = (domain: string) => {
        if (selectedDomains.includes(domain)) {
            setSelectedDomains(selectedDomains.filter(d => d !== domain));
        } else {
            if (selectedDomains.length < siteCount) {
                setSelectedDomains([...selectedDomains, domain]);
            } else {
                alert(`You can only select ${siteCount} domain(s) for this strategy.`);
            }
        }
    };

    return (
        <div className="w-full bg-slate-900/50 p-6 rounded-xl border border-slate-800 mt-8 mb-20 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Strategy & Domains</h3>
                    <p className="text-sm text-slate-400">Step 2 of Campaign Creation</p>
                </div>
            </div>

            {/* STEP 1: Select Count */}
            {step === 'select-count' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 3, 5].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleGenerate(num)}
                            className="group relative p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-xl transition-all text-left"
                        >
                            <div className="absolute top-4 right-4 text-slate-600 group-hover:text-blue-500 transition-colors">
                                <Server className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-bold text-white block mb-2">{num}</span>
                            <span className="text-sm font-medium text-slate-300">
                                {num === 1 ? 'Single Site' : 'Network Strategy'}
                            </span>
                            <p className="text-xs text-slate-500 mt-2">
                                {num === 1 ? 'Target specific niche' : `Dominate ${num} variations`}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {/* STEP 2: Loading / Generating */}
            {step === 'generating' && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <h4 className="text-lg font-medium text-white">Generating AI Domain Ideas...</h4>
                    <p className="text-slate-500 text-sm">Analyzing keywords and extensions</p>
                </div>
            )}

            {/* STEP 3: Selection */}
            {step === 'selection' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-medium">
                            Select {siteCount} Domain{siteCount > 1 ? 's' : ''}:
                            <span className="ml-2 text-blue-400">{selectedDomains.length}/{siteCount}</span>
                        </h4>
                        <button
                            className="text-xs text-slate-400 hover:text-white"
                            onClick={() => handleGenerate(siteCount)} // Regenerate
                        >
                            Regenerate Ideas
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {generatedDomains.map((d, i) => (
                            <div
                                key={i}
                                onClick={() => d.available ? toggleSelection(d.name) : null}
                                className={`p-3 rounded-lg border flex justify-between items-center transition-all cursor-pointer ${selectedDomains.includes(d.name)
                                    ? 'bg-blue-600/20 border-blue-500'
                                    : 'bg-slate-800/50 border-slate-800 hover:border-slate-600'
                                    } ${!d.available && d.available !== null ? 'opacity-50 cursor-not-allowed bg-red-900/10' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    {d.available === null ? (
                                        <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                                    ) : d.available ? (
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedDomains.includes(d.name) ? 'bg-blue-500' : 'bg-green-500'}`}>
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    ) : (
                                        <X className="w-4 h-4 text-red-500" />
                                    )}
                                    <div className="flex flex-col">
                                        <span className={`font-medium ${selectedDomains.includes(d.name) ? 'text-blue-200' : 'text-slate-300'}`}>
                                            {d.name}
                                        </span>
                                        {d.error && (
                                            <span className="text-[10px] text-red-400 leading-tight truncate max-w-[180px]">
                                                {d.error}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {d.available && (
                                    <span className="text-xs font-mono text-green-400">${d.price}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            disabled={selectedDomains.length !== siteCount}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Proceed to Content Setup ({selectedDomains.length})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
