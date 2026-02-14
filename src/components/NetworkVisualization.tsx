'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Link as LinkIcon, Database, Layout } from 'lucide-react';
import { SiteStrategy } from '@/types';

interface NetworkVisualizationProps {
    sites: SiteStrategy[];
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ sites }) => {
    return (
        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800 p-8">
            {/* Central Node */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center justify-center p-6 rounded-full bg-blue-500/10 border border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            >
                <Database className="w-10 h-10 text-blue-400 mb-2" />
                <span className="text-sm font-bold text-blue-200 uppercase tracking-widest">Main Strategy</span>
            </motion.div>

            {/* Network Lines & Site Nodes */}
            <div className="absolute inset-0 flex items-center justify-center">
                {sites.map((site, index) => {
                    const angle = (index * (360 / sites.length) * Math.PI) / 180;
                    const radius = 140;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                        <React.Fragment key={site.id}>
                            {/* Connection Line */}
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: radius, opacity: 0.3 }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                                style={{
                                    position: 'absolute',
                                    height: '1px',
                                    background: 'linear-gradient(90deg, rgba(59,130,246,0.5) 0%, transparent 100%)',
                                    left: '50%',
                                    top: '50%',
                                    transformOrigin: 'left center',
                                    transform: `rotate(${angle}rad)`,
                                }}
                            />

                            {/* Site Node */}
                            <motion.div
                                initial={{ x: 0, y: 0, opacity: 0 }}
                                animate={{ x, y, opacity: 1 }}
                                transition={{ delay: 1 + index * 0.1, duration: 0.5, type: 'spring' }}
                                className="absolute flex flex-col items-center group pointer-events-auto"
                            >
                                <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 group-hover:border-blue-500/50 transition-colors shadow-xl">
                                    {index % 2 === 0 ? <Globe className="w-6 h-6 text-emerald-400" /> : <Layout className="w-6 h-6 text-purple-400" />}
                                </div>
                                <div className="mt-2 text-center pointer-events-none">
                                    <p className="text-xs font-medium text-zinc-100 truncate max-w-[120px]">{site.domain}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{site.niche}</p>
                                </div>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
    );
};
