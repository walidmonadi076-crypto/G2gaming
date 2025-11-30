
import React from 'react';
import Head from 'next/head';
import Ad from '../components/Ad';
import SEO from '../components/SEO';

const QuestsPage: React.FC = () => {
  return (
    <>
      <SEO title="Quests & Rewards - G2gaming" description="Complete quests, surveys, and offers to unlock exclusive gaming rewards." />
      
      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-purple-500 selection:text-white pb-20">
        
        {/* Hero Section */}
        <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
            
            <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-widest mb-6 animate-fade-in-right">
                Offerwall Active
            </span>
            
            <h1 className="relative z-10 text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-none drop-shadow-xl">
                Reward <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient-x">Zone</span>
            </h1>
            
            <p className="relative z-10 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Complete simple tasks, download apps, or take surveys below to support G2gaming and unlock premium content.
            </p>
        </div>

        {/* Offer Wall Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-gray-900 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                
                {/* Header Bar */}
                <div className="bg-gray-800/50 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs font-mono text-gray-500">secure_offerwall_v2.exe</span>
                </div>

                {/* The Ad/Offerwall */}
                <div className="p-4 md:p-8 min-h-[600px] bg-[#0a0a0a]">
                    <Ad placement="quest_page_wall" className="w-full h-full min-h-[600px] bg-transparent border-0 shadow-none" />
                </div>
            
            </div>

            {/* Trust Footer */}
            <div className="mt-12 text-center">
                <p className="text-sm text-gray-600 uppercase tracking-widest font-bold">Supported By</p>
                <div className="flex justify-center gap-8 mt-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder logos for ad networks */}
                    <div className="h-8 w-24 bg-white/10 rounded"></div>
                    <div className="h-8 w-24 bg-white/10 rounded"></div>
                    <div className="h-8 w-24 bg-white/10 rounded"></div>
                </div>
            </div>
        </div>

      </div>
    </>
  );
};

export default QuestsPage;
