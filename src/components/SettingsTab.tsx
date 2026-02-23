'use client';

import { useState } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsTabProps {
  campaignId: string;
  sites: any[];
}

export default function SettingsTab({ campaignId, sites }: SettingsTabProps) {
  // Use the first site's GA ID as default if available
  const initialGaId = sites?.[0]?.ga_id || '';
  const [gaId, setGaId] = useState(initialGaId);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/campaign/${campaignId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gaId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!sites || sites.length === 0) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-yellow-500 font-semibold">Configuration Required</h3>
          <p className="text-yellow-400/80 mt-1 text-sm">
            This campaign doesn't have any linked sites in the new database structure. 
            If you created this campaign before the "Zoro Update", you might need to redeploy or manually link the site.
            Future deployments will appear here automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
          Analytics & Tracking
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Google Analytics Measurement ID
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={gaId}
                  onChange={(e) => setGaId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                />
                <div className="absolute right-3 top-3.5 text-xs text-zinc-600 font-mono pointer-events-none">
                  GA4
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !gaId}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : success ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {success ? 'Saved' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
              Enter your GA4 Measurement ID (e.g., <span className="font-mono text-zinc-400">G-12345678</span>). 
              This will automatically:
              <br/>1. Update the <code className="bg-zinc-800 px-1 py-0.5 rounded mx-1 text-zinc-300 border border-zinc-700">NEXT_PUBLIC_GA_ID</code> environment variable on Vercel.
              <br/>2. Trigger a redeploy for all connected sites ({sites.length}) to apply the changes.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-900/20 border border-green-900/50 rounded-xl text-green-400 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Settings saved successfully! Redeployment triggered.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* List of connected sites */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
        <h4 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Connected Sites</h4>
        <div className="space-y-2">
            {sites.map(site => (
                <div key={site.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800/50">
                    <span className="text-white font-medium">{site.domain}</span>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 font-mono">{site.vercel_project_id || 'No Project ID'}</span>
                        {site.ga_id ? (
                            <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full border border-green-900/50">GA Active</span>
                        ) : (
                            <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">No GA</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
