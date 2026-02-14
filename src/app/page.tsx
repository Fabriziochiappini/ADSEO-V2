'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  ChevronRight,
  Database,
  TrendingUp,
  Globe,
  Layout,
  Zap,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { NetworkVisualization } from '@/components/NetworkVisualization';
import { NetworkStrategy } from '@/types';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<NetworkStrategy | null>(null);

  const handleGenerate = async () => {
    if (!topic || !description) return;
    setLoading(true);
    setError(null);
    setStrategy(null);

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

      setStrategy(data);
    } catch (err: any) {
      console.error('Failed to generate strategy:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Input Panel */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                Generate your Network Strategy
              </h1>
              <p className="text-zinc-400 text-lg">
                Enter your niche and business details to create a multi-domain SEO blueprint.
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
                    placeholder="e.g. Vintage Watches, Sustainable Fashion..."
                    className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 ml-1">Business Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your business goal, target audience, and USP..."
                  rows={4}
                  className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder:text-zinc-600 resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !topic || !description}
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(59,130,246,0.2)]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Generate Blueprint
                  </>
                )}
              </button>
            </div>

            {/* Quick Tips */}
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Growth Hint</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Start with a broad niche and let the AI suggest 3 specific sub-angles to minimize cannibalization.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visualization & Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center bg-red-500/5 border-2 border-dashed border-red-500/20 rounded-3xl"
                >
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-red-200">Generation Failed</h3>
                  <p className="text-zinc-400 mt-2 max-w-sm mb-6">
                    {error}
                  </p>
                  <button
                    onClick={() => setError(null)}
                    className="px-6 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {!strategy && !loading && !error && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl p-12 text-center"
                >
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                    <Database className="w-10 h-10 text-zinc-700" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-300">No Blueprint Active</h3>
                  <p className="text-zinc-500 mt-2 max-w-sm">
                    Fill in the details on the left to generate your multi-domain SEO network strategy.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-8"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-zinc-800 rounded-full" />
                    <div className="w-24 h-24 border-4 border-blue-500 rounded-full absolute top-0 animate-spin border-t-transparent" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold animate-pulse">Analyzing Niche Data...</h3>
                    <p className="text-zinc-500">Fetching Keyword Ideas and Generating Strategy</p>
                  </div>
                </motion.div>
              )}

              {strategy && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Network Architecture</h2>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Analysis Complete
                    </span>
                  </div>

                  <NetworkVisualization sites={strategy.sites} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategy.sites.map((site) => (
                      <div key={site.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-zinc-400" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-600" />
                        </div>
                        <h4 className="font-bold text-zinc-200">{site.domain}</h4>
                        <p className="text-xs text-zinc-500 mt-1 italic">Niche: {site.niche}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {site.target_keywords.slice(0, 3).map((kw, i) => (
                            <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-zinc-800 text-zinc-400">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-2xl bg-blue-600/5 border border-blue-500/20">
                    <h4 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">Overall Strategy</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {strategy.overall_strategy}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
