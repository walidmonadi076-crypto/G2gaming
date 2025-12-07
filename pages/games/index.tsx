
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import type { Game } from '../../types';
import { getAllGames } from '../../lib/data';
import GameCard from '../../components/GameCard';
import SEO from '../../components/SEO';
import FilterButton from '../../components/FilterButton';
import SponsoredGameCard from '../../components/SponsoredGameCard';
import Ad from '../../components/Ad';

interface GamesPageProps {
  searchQuery: string;
  games: Game[];
}

const GamesPage: React.FC<GamesPageProps> = ({ searchQuery, games }) => {
  const router = useRouter();
  const selectedCategory = (router.query.category as string) || 'All';
  const selectedTag = (router.query.tags as string) || null;

  // Extract unique categories
  const categories = useMemo(() => ['All', ...Array.from(new Set(games.map(g => g.category))).sort()], [games]);
  
  // Filter Logic
  const filteredGames = useMemo(() => {
    return games.filter(game => {
        const matchesQuery = game.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
        const matchesTag = !selectedTag || (game.tags && game.tags.includes(selectedTag));
        return matchesQuery && matchesCategory && matchesTag;
    });
  }, [games, selectedCategory, selectedTag, searchQuery]);
  
  const handleCategorySelect = (cat: string) => {
    const newQuery = { ...router.query };
    if (cat === 'All' || cat === selectedCategory) {
        delete newQuery.category;
    } else {
        newQuery.category = cat;
    }
    delete newQuery.tags; // Clear tags when switching categories
    router.push({ pathname: '/games', query: newQuery }, undefined, { shallow: true });
  };
  
  const areFiltersActive = searchQuery || (selectedCategory && selectedCategory !== 'All') || selectedTag;

  return (
    <>
      <SEO title="All Games - G2gaming" description="Browse our extensive collection of free online games." />
      
      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-purple-500 selection:text-white">
        {/* --- Page Header --- */}
        <div className="relative pt-16 pb-8 md:pt-20 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-3/4 h-48 md:h-64 bg-purple-900/20 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12 border-b border-white/5 pb-6 md:pb-8">
                <div>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-2 uppercase leading-[0.9] md:leading-[0.8]">
                        All <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-x">Games</span>
                    </h1>
                    <p className="text-gray-400 text-sm md:text-xl font-bold uppercase tracking-widest mt-4 md:mt-6 max-w-xl flex items-center gap-2 md:gap-3">
                        <span className="w-4 md:w-8 h-[2px] bg-purple-500 inline-block"></span>
                        Discover . Play . Dominate
                    </p>
                </div>
            </div>

            {/* --- Filter & Search Bar --- */}
            <div className="sticky top-16 md:top-20 z-30 bg-[#0d0d0d]/90 backdrop-blur-xl border-y border-white/5 py-3 md:py-4 -mx-4 px-4 sm:px-0 sm:mx-0 sm:border-0 mb-8 md:mb-12">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between">
                    
                    {/* Categories Scrollable Area */}
                    <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0 mask-gradient-right">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 hidden lg:block shrink-0">Filter By //</span>
                        {categories.map(cat => (
                            <FilterButton 
                                key={cat} 
                                label={cat} 
                                isActive={selectedCategory === cat && !selectedTag} 
                                onClick={() => handleCategorySelect(cat)} 
                            />
                        ))}
                    </div>

                    {/* Filter Status / Result Count */}
                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap bg-gray-900 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-800 self-end md:self-auto">
                        {areFiltersActive ? (
                            <span>Found <span className="text-purple-400">{filteredGames.length}</span> titles</span>
                        ) : (
                            <span>Library: <span className="text-white">{games.length}</span> titles</span>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Game Grid with Native Ad Injection --- */}
            {filteredGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-6">
                    {filteredGames.map((game, index) => (
                        <React.Fragment key={game.id}>
                            <GameCard game={game} />
                            {/* Inject Sponsored Native Ad after the 6th game (index 5) */}
                            {index === 5 && <SponsoredGameCard />}
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/50">
                    <div className="bg-gray-800 p-4 md:p-6 rounded-full mb-4 md:mb-6 ring-4 ring-gray-800/50">
                        <svg className="w-10 h-10 md:w-16 md:h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl md:text-3xl font-black uppercase text-white mb-2 tracking-tight">System Glitch</h3>
                    <p className="text-gray-400 text-sm md:text-base font-medium max-w-xs md:max-w-md mb-6 md:mb-8">
                        No games found matching "{searchQuery}" or the selected filters. 
                    </p>
                    <button 
                        onClick={() => router.push('/games')}
                        className="px-8 py-3 md:px-10 md:py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs md:text-sm skew-x-[-10deg] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1"
                    >
                        <span className="block skew-x-[10deg]">Reset System</span>
                    </button>
                </div>
            )}

            {/* Footer Ad Placement */}
            <div className="mt-16 md:mt-20 border-t border-white/5 pt-10 pb-8 flex justify-center">
               <Ad placement="footer_partner" className="w-full max-w-[728px] bg-transparent shadow-none border-0" />
            </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
    const games = await getAllGames();
    return {
        props: {
            games,
        },
        revalidate: 60,
    };
};

export default GamesPage;
