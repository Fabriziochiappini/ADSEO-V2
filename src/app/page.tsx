'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  Database,
  TrendingUp,
  Zap,
  Loader2,
  CheckCircle2,
  List
} from 'lucide-react';
import { TopicAnalysisResult } from '@/types';
import DomainGenerator from '@/components/DomainGenerator';
import ContentSetup from '@/components/ContentSetup';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TopicAnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'analysis' | 'domains' | 'content'>('analysis');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!topic || !description) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep('analysis');

    try {
      const response = await fetch('/api/campaign/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, businessDescription: description })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error: ${response.statusText}`);
      }

      setResult(data);
      setCurrentStep('domains');
    } catch (err: any) {
      console.error('Failed to generate strategy:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDomainsFinalized = (domains: string[]) => {
    setSelectedDomains(domains);
    setCurrentStep('content');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* Hero / Header Section */}
      <header className="relative border-b border-zinc-800 bg-zinc-900/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">ADSEO<span className="text-blue-500">2</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Analyzer</a>
            <a href="#" className="hover:text-white transition-colors">History</a>
            <a href="#" className="hover:text-white transition-colors">Settings</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-sm px-4 py-2 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {currentStep === 'content' ? (
          <ContentSetup
            selectedDomains={selectedDomains}
            keywords={result?.keywords || []}
            onBack={() => setCurrentStep('domains')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Input Panel */}
            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                  Long Tail Explorer
                </h1>
                <p className="text-zinc-400 text-lg">
                  Find low-competition "Long Long Tail" keywords for your niche.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 ml-1">Core Topic / Niche</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. sgomberi milano"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 ml-1">Business Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your services, locations, and target audience..."
                    rows={4}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-zinc-600 resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !topic || !description}
                  className="w-full relative group overflow-hidden bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing Marketplace...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                      <span>Analyze Keywords</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-300">Tip</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Be specific in your description to get the best "Long Tail" results.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Display Panel */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {!loading && !result && !error && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[500px] border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center p-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-2">
                      <Database className="w-8 h-8 text-zinc-700" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-400">Ready to Discover?</h3>
                    <p className="text-zinc-600 max-w-sm">
                      Enter your niche details to see an AI-driven strategy with live market metrics.
                    </p>
                  </motion.div>
                )}

                {!loading && error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full min-h-[500px] border-2 border-dashed border-red-900/30 bg-red-950/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-16 h-16 bg-red-950/20 rounded-2xl flex items-center justify-center mb-6">
                      <Zap className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-red-200">Analysis Failed</h3>
                    <p className="text-zinc-400 mt-2 max-w-sm mb-6 text-sm">
                      {error}
                    </p>
                    <button
                      onClick={handleGenerate}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl font-semibold transition-all border border-zinc-700"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}

                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[500px] border border-zinc-800 bg-zinc-900/10 rounded-3xl flex flex-col items-center justify-center p-12 space-y-8"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-zinc-800 rounded-full" />
                      <div className="w-24 h-24 border-4 border-blue-500 rounded-full absolute top-0 animate-spin border-t-transparent" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold animate-pulse">Deep Analysis in Progress...</h3>
                      <p className="text-zinc-500">
                        1. AI Brainstorming Seed Keywords...<br />
                        2. Mining DataForSEO Real-Time Metrics...<br />
                        3. Filtering for Low Competition Gems...
                      </p>
                    </div>
                  </motion.div>
                )}

                {result && !loading && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        {result.name}
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-normal border border-blue-500/20">
                          {result.keywords.length} Results
                        </span>
                      </h2>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Analysis Complete
                      </span>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                      <div className="max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-700 text-slate-400">
                              <th className="pb-3 font-medium">Keywords Strategy ({result.keywords.length})</th>
                              <th className="pb-3 font-medium">Vol</th>
                              <th className="pb-3 font-medium">KD %</th>
                              <th className="pb-3 font-medium">CPC</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {result.keywords.map((k, i) => (
                              <tr key={i} className="group hover:bg-slate-800/50 transition-colors">
                                <td className="py-3 text-slate-200 group-hover:text-white transition-colors">
                                  {k.keyword}
                                </td>
                                <td className="py-3 text-slate-400">{k.search_volume}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${k.competition_level === 'LOW' ? 'bg-green-500/20 text-green-400' :
                                    k.competition_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>
                                    {(k.competition * 100).toFixed(0)}%
                                  </span>
                                </td>
                                <td className="py-3 text-slate-400">${k.cpc.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* STEP 2: Domain Generator Module */}
                    <DomainGenerator
                      topic={topic}
                      keywords={result.keywords}
                      onDomainsSelected={handleDomainsFinalized}
                    />

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
