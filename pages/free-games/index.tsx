import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import SEO from '../../components/SEO';
import Ad from '../../components/Ad';

interface FreeDeal {
  id: number;
  title: string;
  store_name: string;
  // Handle both string (from JSON) and number (from DB)
  normal_price: string | number;
  sale_price: string | number;
  image_url: string;
  deal_url: string;
  ends_at: string | null;
  tags: string[];
}

const FreeGamesPage = () => {
  const [deals, setDeals] = useState<FreeDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'epic' | 'steam' | 'gog'>('all');

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        let url = '/api/free-games?limit=24';
        if (filter === 'epic') url += '&store=Epic';
        if (filter === 'steam') url += '&store=Steam';
        if (filter === 'gog') url += '&store=GOG';
        
        const res = await fetch(url);
        const data = await res.json();
        setDeals(data.deals || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeals();
  }, [filter]);

  return (
    <>
      <SEO 
        title="Free Games Radar - Claim 100% Free PC Games" 
        description="Daily updated list of free games from Epic Games, Steam, GOG, and more. Don't miss a limited-time free game deal again."
        keywords={['free games', 'epic free games', 'steam free weekend', 'pc game deals']}
      />

      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-green-500 selection:text-white pb-20">
        
        {/* Hero Section */}
        <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-80 bg-green-900/20 blur-[100px] rounded-full pointer-events-none" />
            
            <h1 className="relative z-10 text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-none drop-shadow-xl">
                Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Games</span> Radar
            </h1>
            
            <p className="relative z-10 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                Legit, 100% free games from major stores. No scams, just deals. Updated daily.
            </p>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 mb-10">
            <div className="flex flex-wrap justify-center gap-4">
                {[
                    { id: 'all', label: 'All Deals' },
                    { id: 'epic', label: 'Epic Games' },
                    { id: 'steam', label: 'Steam Free' },
                    { id: 'gog', label: 'DRM-Free' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider border transition-all ${
                            filter === tab.id 
                            ? 'bg-green-600 border-green-500 text-white shadow-lg' 
                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-green-500 hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Deals Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
                <div className="text-center py-20 text-gray-500">Scanning for deals...</div>
            ) : deals.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-xl font-bold text-gray-400 mb-4">No free deals found right now.</p>
                    <p className="text-sm text-gray-500">Try changing the filter or come back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {deals.map(deal => (
                        <div key={deal.id} className="group bg-gray-900 rounded-xl overflow-hidden border border-white/5 hover:border-green-500/50 transition-all hover:shadow-[0_0_25px_rgba(34,197,94,0.2)] hover:-translate-y-1 flex flex-col">
                            {/* Image */}
                            <div className="relative aspect-video bg-black">
                                <Image src={deal.image_url} alt={deal.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-md">
                                    FREE
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-gray-300 text-[10px] font-bold uppercase px-2 py-1 rounded border border-white/10">
                                    {deal.store_name}
                                </div>
                            </div>
                            
                            {/* Info */}
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1" title={deal.title}>{deal.title}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-gray-500 text-xs line-through">${deal.normal_price}</span>
                                    <span className="text-green-400 text-xs font-bold uppercase">100% OFF</span>
                                </div>
                                
                                <div className="mt-auto">
                                    <a 
                                        href={deal.deal_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block w-full py-2 bg-white text-black font-black uppercase text-xs text-center rounded hover:bg-green-400 transition-colors"
                                    >
                                        Claim Deal
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Suggestions / Footer */}
            <div className="mt-20 border-t border-white/10 pt-10">
                <div className="flex flex-col md:flex-row gap-8 justify-center">
                    <div className="bg-gray-900 rounded-xl p-6 border border-white/5 flex-1 max-w-md">
                        <h3 className="text-lg font-bold text-white mb-2">Don't Miss Out</h3>
                        <p className="text-gray-400 text-sm mb-4">Join our community to get instant alerts for free games.</p>
                        <Ad placement="game_horizontal" className="w-full bg-black/30" showLabel={false} />
                    </div>
                </div>
            </div>
        </div>

      </div>
    </>
  );
};

export default FreeGamesPage;