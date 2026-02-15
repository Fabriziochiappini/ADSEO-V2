'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X, Loader2, Globe } from 'lucide-react';

export default function DomainSelector({ topic }: { topic: string }) {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Suggest a domain based on topic? 
    // For now just let user type.

    const handleCheck = async () => {
        if (!domain) return;
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/domain/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain })
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeploy = async () => {
        if (!result || !result.available) return;
        setLoading(true); // Reuse loading state or add a new one

        try {
            const res = await fetch('/api/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: result.domain,
                    topic: topic
                })
            });
            const data = await res.json();

            if (data.success) {
                alert(`Project Created! \nURL: ${data.projectUrl}\n\nPlease point your Namecheap DNS for ${result.domain} to 76.76.21.21`);
                window.open(data.dashboardUrl, '_blank');
            } else {
                alert('Deployment failed: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Deployment failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-slate-900/50 p-6 rounded-xl border border-slate-800 mt-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Find Your Domain
            </h3>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleCheck}
                    disabled={loading || !domain}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Check
                </button>
            </div>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-lg flex items-center justify-between border ${result.available
                            ? 'bg-green-500/10 border-green-500/50 text-green-400'
                            : 'bg-red-500/10 border-red-500/50 text-red-400'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        {result.available ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        <div>
                            <p className="font-bold text-lg">{result.domain}</p>
                            <p className="text-sm opacity-80">
                                {result.available ? 'Available for registration' : 'Already taken'}
                            </p>
                        </div>
                    </div>

                    {result.available && (
                        <div className="text-right">
                            <p className="text-xl font-bold text-white">${result.price}</p>
                            <button
                                onClick={handleDeploy}
                                disabled={loading}
                                className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded mt-1 shadow-lg shadow-green-900/20"
                            >
                                {loading ? 'Deploying...' : 'Select & Deploy'}
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
