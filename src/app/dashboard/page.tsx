'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Search,
  Loader2,
  Clock,
  Calendar,
  ArrowRight,
  Database,
  Layout,
  FileText
} from 'lucide-react';

interface Campaign {
  id: string;
  topic: string;
  description: string;
  created_at: string;
  app_id: string;
  domain?: string | null;
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/campaigns');
        if (!res.ok) throw new Error('Failed to fetch campaigns');
        const data = await res.json();
        setCampaigns(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden group-hover:bg-blue-500 transition-colors">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight">ADSEO<span className="text-blue-500">2</span></span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Analyzer</Link>
            <Link href="/dashboard" className="text-white font-semibold">Dashboard</Link>
            <a href="#" className="hover:text-white transition-colors">Settings</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-sm px-4 py-2 rounded-full bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors border border-zinc-700">
              Account
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Campaign Dashboard</h1>
            <p className="text-zinc-400">Manage your SEO campaigns and monitor performance.</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20"
          >
            <Search className="w-4 h-4" />
            New Campaign
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-zinc-500">Loading your campaigns...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-4">Error loading campaigns: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-white bg-red-600/20 hover:bg-red-600/30 px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
              <Database className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">No Campaigns Yet</h3>
            <p className="text-zinc-500 max-w-md mb-8">
              Start by analyzing a keyword to create your first SEO campaign.
            </p>
            <Link
              href="/"
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              Start Analysis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                onClick={() => window.location.href = `/dashboard/${campaign.id}`}
                className="group cursor-pointer block bg-zinc-900/50 border border-zinc-800 rounded-3xl p-7 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 relative overflow-hidden"
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all duration-500" />

                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-all duration-300">
                    <Layout className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800/50">
                      ID: {campaign.id.slice(0, 8)}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {campaign.topic}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-8 leading-relaxed h-10">
                  {campaign.description}
                </p>

                {campaign.domain && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://${campaign.domain}`, '_blank');
                    }}
                    className="flex items-center justify-between mb-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300 group/domain"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-tighter">Domain</span>
                        <span className="text-sm font-bold text-blue-100 truncate max-w-[150px]">
                          {campaign.domain}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 group-hover/domain:border-blue-500/50 transition-all">
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover/domain:text-blue-400 group-hover/domain:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-5 border-t border-zinc-800/50 text-zinc-500">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs font-medium">Articles</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">Schedule</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400 group-hover:text-blue-400 transition-colors">
                    <span className="text-xs font-bold uppercase tracking-tighter">Details</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}