
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
  variant?: 'default' | 'vertical' | 'featured';
}

const GameCard: React.FC<GameCardProps> = ({ game, variant = 'default' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Auto-play was prevented (browser policy) or interrupted
          console.debug("Video autoplay prevented:", error);
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'new': return 'bg-blue-600';
      case 'hot': return 'bg-red-600';
      case 'top': return 'bg-yellow-600 text-black';
      case 'play on comet': return 'bg-purple-600';
      case 'updated': return 'bg-green-600';
      default: return 'bg-gray-700 text-gray-300';
    }
  };
  
  const getCardClasses = () => {
    switch(variant) {
      case 'vertical':
        return "aspect-[2/3]";
      case 'featured':
        return "aspect-[16/9] md:aspect-[21/9]";
      case 'default':
      default:
        return "aspect-[16/10]"; 
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
        return 'text-lg font-bold tracking-tight';
    }
  };

  return (
    <Link 
      href={`/games/${game.slug}`}
      className="group block relative rounded-xl bg-[#0d0d0d] transition-all duration-300 ease-out hover:scale-105 hover:z-20 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] hover:ring-2 hover:ring-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ring-offset-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`relative w-full h-full overflow-hidden rounded-xl ${getCardClasses()}`}>
        
        {/* Layer 1: Static Image (Visible when not playing) */}
        <Image 
          src={game.imageUrl} 
          alt={game.title} 
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className={`object-cover transition-opacity duration-300 ${isPlaying && game.videoUrl ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Layer 2: Video Preview (Visible on Hover) */}
        {game.videoUrl && (
          <video
            ref={videoRef}
            src={game.videoUrl}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        
        {/* Layer 3: Gradient Overlay (Always visible for text readability) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"></div>
        
        {/* Layer 4: Content */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
           <div className="flex flex-wrap gap-1">
            {game.tags && game.tags[0] && (
                <span className={`text-[10px] uppercase tracking-wider font-bold text-white px-2 py-0.5 rounded shadow-sm ${getTagColor(game.tags[0])}`}>
                  {game.tags[0]}
                </span>
            )}
           </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
          <div className="flex items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-6 left-4">
             {/* Small Category Tag appearing on hover above title */}
             <span className="text-[10px] font-bold uppercase text-purple-400 tracking-widest bg-purple-900/30 px-2 py-0.5 rounded border border-purple-500/30 backdrop-blur-md">
               {game.category}
             </span>
          </div>

          <h3 className={`text-white drop-shadow-md line-clamp-1 group-hover:line-clamp-none group-hover:text-purple-100 transition-colors ${getTitleClasses()}`}>
            {game.title}
          </h3>
          
          {/* Always visible category for mobile/non-hover states, hidden on hover to swap with the neon tag above */}
          <p className="text-gray-400 text-xs font-medium mt-1 group-hover:opacity-0 transition-opacity duration-200">
             {game.category}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
