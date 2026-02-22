'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileText,
  Clock
} from 'lucide-react';

interface ArticleTestPanelProps {
  campaignId?: string;
}

export default function ArticleTestPanel({ campaignId }: ArticleTestPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testKeyword, setTestKeyword] = useState('digital marketing strategies');

  const testDripFeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/cron/trigger-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Test failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const forceCreateArticle = async () => {
    if (!testKeyword.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Prima popola la coda con un articolo di test
      const populateResponse = await fetch('/api/debug-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'insert_queue_single',
          article: {
            campaign_id: campaignId || 'test-campaign-123',
            keyword: testKeyword,
            status: 'pending',
            scheduled_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        })
      });

      if (!populateResponse.ok) {
        throw new Error('Failed to create test article');
      }

      // Poi triggera il drip feed
      const response = await fetch('/api/cron/trigger-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Test failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const forceMultipleArticles = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/cron/force-drip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          force: true, 
          limit: 3 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Test failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Test Articoli</h3>
            <p className="text-sm text-zinc-400">Testa la creazione e pubblicazione articoli</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">Live Testing</span>
        </div>
      </div>

      {/* Input per keyword personalizzata */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Keyword per Test</label>
        <input
          type="text"
          value={testKeyword}
          onChange={(e) => setTestKeyword(e.target.value)}
          placeholder="Inserisci una keyword per testare..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* Pulsanti di test */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={forceCreateArticle}
          disabled={loading || !testKeyword.trim()}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Crea Articolo Test
        </button>

        <button
          onClick={testDripFeed}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Testa Drip Feed
        </button>

        <button
          onClick={forceMultipleArticles}
          disabled={loading}
          className="sm:col-span-2 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Forza 3 Articoli
        </button>
      </div>

      {/* Risultati */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">Test Completato</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><span className="text-zinc-400">Messaggio:</span> <span className="text-white">{result.message}</span></p>
            {result.title && (
              <p><span className="text-zinc-400">Articolo:</span> <span className="text-white">{result.title}</span></p>
            )}
            {result.results && (
              <>
                <p><span className="text-zinc-400">Processati:</span> <span className="text-white">{result.results.processed}</span></p>
                <p><span className="text-zinc-400">Falliti:</span> <span className="text-white">{result.results.failed}</span></p>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Errori */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-950/20 border border-red-900/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-red-400">Errore</span>
          </div>
          <p className="text-sm text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Info */}
      <div className="text-xs text-zinc-500 space-y-1">
        <p>• "Crea Articolo Test" crea e pubblica un articolo con la keyword specificata</p>
        <p>• "Testa Drip Feed" processa articoli in coda con scheduled_at passato</p>
        <p>• "Forza 3 Articoli" pubblica forzatamente fino a 3 articoli</p>
      </div>
    </motion.div>
  );
}