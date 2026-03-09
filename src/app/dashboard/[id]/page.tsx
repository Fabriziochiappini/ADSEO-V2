'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Zap, ArrowLeft, Loader2, Calendar, Layout,
    FileText, List, Settings, BarChart3, Clock, CheckCircle2
} from 'lucide-react';
import ArticleTestPanel from '@/components/ArticleTestPanel';
import SettingsTab from '@/components/SettingsTab';

export default function CampaignDetail() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!id) return;

        async function fetchCampaign() {
            try {
                const res = await fetch(`/api/campaigns/${id}`);
                if (!res.ok) throw new Error('Failed to fetch campaign');
                const data = await res.json();
                setCampaign(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchCampaign();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
    if (!campaign) return <div className="min-h-screen bg-black text-white p-8">Campaign not found</div>;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            {/* Header Dashboard */}
            <header className="border-b border-zinc-800 bg-zinc-900/20 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="h-6 w-px bg-zinc-800 mx-2"></div>
                        <span className="font-bold text-lg text-white truncate max-w-[200px]">{campaign.topic}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-zinc-500 px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
                            ID: {id?.slice(0, 8)}...
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto">
                    {['overview', 'articles', 'queue', 'settings', 'test'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Stats Cards */}
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-zinc-400">Published Articles</h3>
                                </div>
                                <p className="text-3xl font-bold text-white">{campaign.articles?.length || 0}</p>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                                        <Clock className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-zinc-400">Scheduled / Queue</h3>
                                </div>
                                <p className="text-3xl font-bold text-white">{campaign.queue?.length || 0}</p>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-zinc-400">Keywords Tracked</h3>
                                </div>
                                <p className="text-3xl font-bold text-white">{campaign.keywords?.length || 0}</p>
                            </div>

                            {/* Description */}
                            <div className="lg:col-span-3 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8">
                                <h3 className="text-lg font-semibold text-white mb-4">Campaign Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Topic</label>
                                        <p className="text-white text-lg">{campaign.topic}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Created At</label>
                                        <p className="text-zinc-300">{new Date(campaign.created_at).toLocaleString()}</p>
                                    </div>
                                    {campaign.sites?.[0]?.domain && (
                                        <div>
                                            <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Associated Domain</label>
                                            <a
                                                href={`https://${campaign.sites[0].domain}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                            >
                                                {campaign.sites[0].domain}
                                                <Zap className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}
                                    <div className="md:col-span-2">
                                        <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Business Description</label>
                                        <p className="text-zinc-400 leading-relaxed bg-zinc-900 p-4 rounded-xl border border-zinc-800/50">
                                            {campaign.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ARTICLES TAB */}
                    {activeTab === 'articles' && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-900/80 border-b border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Title</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Published Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {campaign.articles?.length > 0 ? (
                                        campaign.articles.map((article: any) => (
                                            <tr key={article.id} className="hover:bg-zinc-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-white">{article.title}</div>
                                                    <div className="text-xs text-zinc-500 font-mono mt-1">/{article.slug}</div>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-400 text-sm">
                                                    {new Date(article.published_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50">
                                                        Published
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                                                No articles published yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* QUEUE TAB */}
                    {activeTab === 'queue' && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-900/80 border-b border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Keyword</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Scheduled For</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {campaign.queue?.length > 0 ? (
                                        campaign.queue.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-zinc-300">
                                                    {item.keyword}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-400 text-sm">
                                                    {new Date(item.scheduled_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'completed' ? 'bg-green-900/30 text-green-400 border-green-900/50' :
                                                            item.status === 'processing' ? 'bg-blue-900/30 text-blue-400 border-blue-900/50' :
                                                                item.status === 'failed' ? 'bg-red-900/30 text-red-400 border-red-900/50' :
                                                                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                        }`}>
                                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                                                Queue is empty.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <SettingsTab campaignId={id as string} sites={campaign.sites || []} />
                    )}

                    {/* TEST TAB */}
                    {activeTab === 'test' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
                                <Clock className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-yellow-400 font-semibold text-sm">Testing Mode</h4>
                                    <p className="text-yellow-500/80 text-xs mt-1">
                                        Use these tools to manually trigger article generation and test the publishing flow.
                                        Actions here affect the live campaign.
                                    </p>
                                </div>
                            </div>

                            <ArticleTestPanel campaignId={id as string} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}