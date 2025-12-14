
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '../types';
import { getEmbedUrl } from '../lib/utils';

interface GameCardProps {
  game: Game;
  variant?: 'default' | 'vertical' | 'featured' | 'poster';
}

const GameCard: React.FC<GameCardProps> = ({ game, variant = 'default' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const embedUrl = getEmbedUrl(game.videoUrl);

  const handleMouseEnter = () => {
    setIsPlaying(true);
    // Only play direct files, iframes handle themselves via autoplay param usually
    if (videoRef.current && !embedUrl) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.debug("Video autoplay prevented:", error);
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    if (videoRef.current && !embedUrl) {
      videoRef.current.pause();
    }
  };

  // Mock rating based on ID if not available (consistent per game)
  const rating = 80 + (game.id % 19);

  return (
    <Link 
      href={`/games/${game.slug}`}
      className="group relative block w-full bg-[#1e293b] rounded-[2rem] p-3 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl hover:shadow-purple-500/20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Image Container (Top) */}
      <div className="relative w-full aspect-[16/10] rounded-[1.5rem] overflow-hidden mb-4 bg-gray-900">
        {/* Static Image with Fallback */}
        {!imageError ? (
          <Image 
            src={game.imageUrl} 
            alt={game.title} 
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-300 ${isPlaying && (videoLoaded || embedUrl) ? 'opacity-0' : 'opacity-100'}`}
            priority={variant === 'featured'}
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback to standard img tag for hotlinked/problematic images
          <img 
            src={game.imageUrl} 
            alt={game.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying && (videoLoaded || embedUrl) ? 'opacity-0' : 'opacity-100'}`}
            referrerPolicy="no-referrer"
          />
        )}

        {/* 2. Video Preview Layer */}
        {game.videoUrl && (
          embedUrl ? (
             /* YouTube/Vimeo Iframe - Only load/show on hover */
             isPlaying && (
               <div className="absolute inset-0 w-full h-full bg-black">
                 <iframe 
                   src={embedUrl}
                   className="w-full h-full pointer-events-none" 
                   title={game.title}
                   allow="autoplay; encrypted-media"
                   loading="lazy"
                 />
               </div>
             )
          ) : (
            /* Direct File (MP4) */
            <video
              ref={videoRef}
              src={game.videoUrl}
              muted
              loop
              playsInline
              preload="none"
              onLoadedData={() => setVideoLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying && videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )
        )}
      </div>

      {/* 3. Content Body (Bottom) */}
      <div className="px-1 pb-1">
        {/* Header: Title + Mini Image */}
        <div className="flex justify-between items-start mb-3 gap-2">
            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                {game.title}
            </h3>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-600 shrink-0 bg-gray-800">
                 {!imageError ? (
                    <Image src={game.imageUrl} alt="icon" fill className="object-cover" />
                 ) : (
                    <img src={game.imageUrl} alt="icon" className="w-full h-full object-cover" />
                 )}
            </div>
        </div>

        {/* Categories/Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1.5 bg-[#0f172a] text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/5">
                {game.category}
            </span>
            {game.tags?.slice(0, 1).map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-[#0f172a] text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/5">
                    {tag}
                </span>
            ))}
        </div>

        {/* Footer: Rating + Action Button */}
        <div className="flex items-center justify-between gap-3">
            {/* Rating Box */}
            <div className="flex items-center gap-2 bg-[#0f172a] rounded-2xl px-3 py-2 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#84cc16] flex items-center justify-center text-black shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-bold uppercase leading-none mb-0.5">Rating</span>
                    <span className="text-sm font-bold text-white leading-none">{rating}%</span>
                </div>
            </div>

            {/* Action Button */}
            <button className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-2xl py-3 px-4 font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                <span>Free</span>
            </button>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
