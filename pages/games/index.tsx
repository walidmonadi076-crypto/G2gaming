
import React, { useMemo } from 'react';
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
  
  // Platform selection (Default to PC if not set)
  const selectedPlatform = (router.query.platform as string) || 'pc';

  // Extract unique categories based on current platform games
  const categories = useMemo(() => {
      const platformGames = games.filter(g => 
          selectedPlatform === 'mobile' ? g.platform === 'mobile' : (g.platform === 'pc' || !g.platform)
      );
      return ['All', ...Array.from(new Set(platformGames.map(g => g.category))).sort()];
  }, [games, selectedPlatform]);
  
  // Filter Logic
  const filteredGames = useMemo(() => {
    return games.filter(game => {
        const matchesQuery = game.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
        const matchesTag = !selectedTag || (game.tags && game.tags.includes(selectedTag));
        
        // STRICT Platform Matching
        const isMobile = game.platform === 'mobile';
        const matchesPlatform = selectedPlatform === 'mobile' ? isMobile : !isMobile;

        return matchesQuery && matchesCategory && matchesTag && matchesPlatform;
    });
  }, [games, selectedCategory, selectedTag, searchQuery, selectedPlatform]);
  
  const handleCategorySelect = (cat: string) => {
    const newQuery: Record<string, any> = { ...router.query };
    if (cat === 'All' || cat === selectedCategory) {
        delete newQuery.category;
    } else {
        newQuery.category = cat;
    }
    delete newQuery.tags; // Clear tags when switching categories
    router.push({ pathname: '/games', query: newQuery }, undefined, { shallow: true });
  };

  const handlePlatformSelect = (platform: 'pc' | 'mobile') => {
      const newQuery: Record<string, any> = { ...router.query, platform };
      delete newQuery.category; // Reset category when switching platform
      delete newQuery.tags;
      router.push({ pathname: '/games', query: newQuery }, undefined, { shallow: true });
  };
  
  const areFiltersActive = searchQuery || (selectedCategory && selectedCategory !== 'All') || selectedTag;

  return (
    <>
      <SEO title="Library - G2gaming" description="Browse our extensive collection of free online games." />
      
      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-purple-500 selection:text-white">
        
        {/* --- Mobile App-Like Header --- */}
        <div className="lg:hidden px-4 pt-6 pb-2 bg-gradient-to-b from-[#0d0d0d] to-[#0d0d0d]/90 sticky top-0 z-40 backdrop-blur-md border-b border-white/5">
            <div className="flex justify-between items-end mb-4">
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                    Game<span className="text-purple-500">Lib</span>
                </h1>
                
                {/* Platform Toggles Mobile */}
                <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                    <button 
                        onClick={() => handlePlatformSelect('pc')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${selectedPlatform === 'pc' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}
                    >
                        PC / Web
                    </button>
                    <button 
                        onClick={() => handlePlatformSelect('mobile')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${selectedPlatform === 'mobile' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}
                    >
                        Mobile
                    </button>
                </div>
            </div>
            
            {/* Mobile Filter Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mask-gradient-right">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={`
                            whitespace-nowrap px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all duration-200
                            ${selectedCategory === cat && !selectedTag
                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'}
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-20 lg:pt-20">
            {/* --- Desktop Header (Hidden on Mobile) --- */}
            <div className="hidden lg:flex relative z-10 flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
                <div>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-2 uppercase leading-[0.8]">
                        {selectedPlatform === 'mobile' ? 'Mobile' : 'All'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-x">Games</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-bold uppercase tracking-widest mt-6 max-w-xl flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-purple-500 inline-block"></span>
                        {selectedPlatform === 'mobile' ? 'iOS & Android Exclusives' : 'Discover . Play . Dominate'}
                    </p>
                </div>

                {/* Desktop Platform Switcher */}
                <div className="flex bg-gray-900 p-1.5 rounded-xl border border-white/10">
                    <button 
                        onClick={() => handlePlatformSelect('pc')}
                        className={`px-8 py-3 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${selectedPlatform === 'pc' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        PC Games
                    </button>
                    <button 
                        onClick={() => handlePlatformSelect('mobile')}
                        className={`px-8 py-3 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${selectedPlatform === 'mobile' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Mobile Games
                    </button>
                </div>
            </div>

            {/* --- Desktop Filters (Hidden on Mobile) --- */}
            <div className="hidden lg:block sticky top-20 z-30 bg-[#0d0d0d]/80 backdrop-blur-xl border-y border-white/5 py-4 -mx-4 px-4 sm:px-0 sm:mx-0 sm:border-0 sm:mb-12">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 shrink-0">Filter By //</span>
                        {categories.map(cat => (
                            <FilterButton 
                                key={cat} 
                                label={cat} 
                                isActive={selectedCategory === cat && !selectedTag} 
                                onClick={() => handleCategorySelect(cat)} 
                            />
                        ))}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
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
                // Added items-stretch to force cards to be same height
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 mt-4 lg:mt-0 auto-rows-fr">
                    {filteredGames.map((game, index) => (
                        <React.Fragment key={game.id}>
                            <GameCard game={game} />
                            {/* Inject Sponsored Native Ad after the 6th game (index 5) */}
                            {index === 5 && (
                                <div className="col-span-2 sm:col-span-1 h-full"> 
                                    <SponsoredGameCard />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/50">
                    <div className="bg-gray-800 p-6 rounded-full mb-6 ring-4 ring-gray-800/50">
                        <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-3xl font-black uppercase text-white mb-2 tracking-tight">System Glitch</h3>
                    <p className="text-gray-400 font-medium max-w-md mb-8">
                        No games found matching "{searchQuery}" or the selected filters. 
                    </p>
                    <button 
                        onClick={() => router.push('/games')}
                        className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-sm skew-x-[-10deg] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1"
                    >
                        <span className="block skew-x-[10deg]">Reset System</span>
                    </button>
                </div>
            )}

            {/* Footer Ad Placement */}
            <div className="mt-20 border-t border-white/5 pt-10 pb-8 flex justify-center">
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
