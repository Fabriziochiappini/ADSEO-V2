'use client';

import { useState } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';

interface SettingsTabProps {
  campaignId: string;
  sites: any[];
}

function LinkSiteForm({ campaignId }: { campaignId: string }) {
  const [domain, setDomain] = useState('');
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');

  const handleLink = async () => {
    if (!domain.trim()) return;
    setLinking(true);
    setError('');
    try {
      const res = await fetch(`/api/campaign/${campaignId}/link-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore nel collegamento');
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
          Collega un sito a questa campagna
        </h3>
        <p className="text-zinc-400 text-sm mb-6">
          Inserisci il dominio del sito già deployato per abilitare la gestione Analytics.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLink()}
            placeholder="es. miosito.it"
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
          <button
            onClick={handleLink}
            disabled={linking || !domain.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
          >
            {linking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link2 className="w-5 h-5" />}
            Collega
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
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
    return <LinkSiteForm campaignId={campaignId} />;
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
              Inserisci il tuo GA4 Measurement ID (es. <span className="font-mono text-zinc-400">G-12345678</span>).
              <br />Il tracking si attiva automaticamente su tutti i siti collegati ({sites.length}) senza redeploy.
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
              <p>GA ID salvato! Il tracking Analytics è attivo su questo sito. Gli altri siti hanno il loro GA ID separato.</p>
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
