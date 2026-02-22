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
              <Link 
                key={campaign.id} 
                href={`/dashboard/${campaign.id}`}
                className="group block bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all hover:shadow-xl hover:shadow-black/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Layout className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xs font-mono text-zinc-500 flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                    <Clock className="w-3 h-3" />
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {campaign.topic}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-6 h-10">
                  {campaign.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Articles
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Schedule
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}