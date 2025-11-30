
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import type { Game } from '../../types';
import { getAllGames } from '../../lib/data';
import GameCard from '../../components/GameCard';
import SEO from '../../components/SEO';

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
            relative px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 border
            ${isActive 
                ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 hover:bg-gray-800'
            }
        `}
    >
        {label}
    </button>
);

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
      
      <div className="min-h-screen bg-[#0d0d0d] text-white">
        {/* --- Page Header --- */}
        <div className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                        All <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Games</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl">
                        Discover and play high-quality games instantly. No downloads required.
                    </p>
                    {/* Neon Underline Animation */}
                    <div className="h-1 w-24 bg-purple-600 rounded-full mt-4 shadow-[0_0_10px_#9333ea] animate-pulse"></div>
                </div>
            </div>

            {/* --- Filter & Search Bar --- */}
            <div className="sticky top-20 z-30 backdrop-blur-xl bg-[#0d0d0d]/80 border-y border-gray-800/50 py-4 -mx-4 px-4 sm:px-0 sm:mx-0 sm:rounded-xl sm:border sm:px-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    {/* Categories Scrollable Area */}
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 hidden sm:block">Filter:</span>
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
                    <div className="text-sm text-gray-400 font-medium whitespace-nowrap">
                        {areFiltersActive ? (
                            <span>Found <span className="text-white font-bold">{filteredGames.length}</span> results</span>
                        ) : (
                            <span>Showing all <span className="text-white font-bold">{games.length}</span> games</span>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Game Grid --- */}
            {filteredGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filteredGames.map(game => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-gray-800/50 p-6 rounded-full mb-4">
                        <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No games found</h3>
                    <p className="text-gray-400 max-w-md">
                        We couldn't find any games matching "{searchQuery}" or the selected filters. 
                        Try adjusting your search terms.
                    </p>
                    <button 
                        onClick={() => router.push('/games')}
                        className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
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
