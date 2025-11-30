
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
  variant?: 'default' | 'vertical' | 'featured';
}

const GameCard: React.FC<GameCardProps> = ({ game, variant = 'default' }) => {
  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'new': return 'bg-blue-600';
      case 'hot': return 'bg-red-600';
      case 'top': return 'bg-yellow-600 text-black';
      case 'play on comet': return 'bg-purple-600';
      case 'updated': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  }
  
  const getCardClasses = () => {
    switch(variant) {
      case 'vertical':
        return "aspect-[2/3]";
      case 'featured':
        return "aspect-[16/9] md:aspect-[21/9]";
      case 'default':
      default:
        return "aspect-[16/10]"; // Slightly taller than video for better composition
    }
  };

  const getTitleClasses = () => {
    switch(variant) {
      case 'vertical':
        return 'text-sm font-semibold leading-tight';
      case 'featured':
        return 'text-2xl md:text-3xl font-extrabold';
      case 'default':
      default:
        return 'text-base font-bold';
    }
  };

  const isVertical = variant === 'vertical';

  return (
    <Link 
      href={`/games/${game.slug}`}
      className="group block relative rounded-xl overflow-hidden bg-gray-800 shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 ring-offset-2 ring-offset-gray-900"
    >
      <div className={`relative w-full h-full overflow-hidden ${getCardClasses()}`}>
        <Image 
          src={game.imageUrl} 
          alt={game.title} 
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
        
        {/* Tags */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {game.tags && game.tags[0] && (
              <span className={`text-[10px] uppercase tracking-wider font-bold text-white px-2 py-0.5 rounded shadow-sm ${getTagColor(game.tags[0])}`}>
                {game.tags[0]}
              </span>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h3 className={`text-white drop-shadow-md line-clamp-2 ${getTitleClasses()}`}>
            {game.title}
          </h3>
          {/* Optional: Add category or extra info on hover for non-vertical cards */}
          {!isVertical && (
             <p className="text-gray-300 text-xs mt-1 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
               {game.category}
             </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
