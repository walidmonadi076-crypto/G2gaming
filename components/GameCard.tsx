
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

  // Pseudo-random rating generator
  const rating = game.id ? 80 + (game.id % 15) : 95;

  // Simulate download count based on ID/ViewCount or random logic for demo
  // In real app, use game.download_count
  const rawDownloads = game.view_count ? game.view_count * 15 : (game.id * 8421) + 5000;
  
  const formatDownloads = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
      return num.toString();
  };

  return (
    <Link 
      href={`/games/${game.slug}`}
      className="group relative flex flex-col w-full h-full bg-[#1e293b] rounded-[1.5rem] p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 ring-1 ring-white/5 hover:ring-purple-500/30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Image Container - Fixed Aspect Ratio */}
      <div className="relative w-full aspect-[16/9] rounded-[1rem] overflow-hidden mb-3 bg-gray-900 shrink-0 shadow-inner">
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
          <img 
            src={game.imageUrl} 
            alt={game.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying && (videoLoaded || embedUrl) ? 'opacity-0' : 'opacity-100'}`}
            referrerPolicy="no-referrer"
          />
        )}

        {/* Video Layer */}
        {game.videoUrl && (
          embedUrl ? (
             isPlaying && (
               <div className="absolute inset-0 w-full h-full bg-black z-10">
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
            <video
              ref={videoRef}
              src={game.videoUrl}
              muted
              loop
              playsInline
              preload="none"
              onLoadedData={() => setVideoLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${isPlaying && videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )
        )}
        
        {/* Overlay Gradient on Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent opacity-20 pointer-events-none" />
      </div>

      {/* 2. Content Body - Flex Grow to push footer down */}
      <div className="flex flex-col flex-grow px-1">
        
        {/* Title & Icon Row */}
        <div className="flex justify-between items-start gap-3 mb-2">
            <h3 className="text-white font-extrabold text-[15px] leading-tight line-clamp-2 tracking-tight group-hover:text-purple-300 transition-colors">
                {game.title}
            </h3>
            {/* Small Square Icon */}
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-gray-600 shrink-0 bg-gray-800 shadow-sm">
                 {!imageError ? (
                    <Image src={game.imageUrl} alt="icon" fill className="object-cover" />
                 ) : (
                    <img src={game.imageUrl} alt="icon" className="w-full h-full object-cover" />
                 )}
            </div>
        </div>

        {/* Categories/Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="px-2 py-1 bg-[#0f172a] text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-white/5">
                {game.category}
            </span>
            {game.tags?.includes('Play on Comet') && (
                <span className="px-2 py-1 bg-[#0f172a] text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-blue-500/20">
                    Play on Comet
                </span>
            )}
        </div>

        {/* 3. Footer - Pushed to bottom */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            {/* Rating Pill */}
            <div className="flex items-center gap-2 bg-[#0f172a] rounded-xl px-2.5 py-2 border border-white/5 shrink-0">
                <div className="w-5 h-5 rounded-full bg-[#84cc16] flex items-center justify-center text-black shrink-0 shadow-[0_0_8px_rgba(132,204,22,0.6)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-[7px] text-gray-500 font-bold uppercase leading-none">Rating</span>
                    <span className="text-[11px] font-bold text-white leading-none">{rating}%</span>
                </div>
            </div>

            {/* Download Stats (Replaces Free Button) */}
            <div className="flex-1 flex items-center justify-end gap-2 bg-[#0f172a] rounded-xl px-3 py-2 border border-white/5">
                <div className="text-right">
                    <span className="block text-[13px] font-black text-white leading-none tracking-tight">
                        {formatDownloads(rawDownloads)}
                    </span>
                    <span className="block text-[8px] text-gray-500 uppercase font-bold tracking-widest leading-none mt-0.5">
                        Downloads
                    </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-purple-400 border border-gray-700 shadow-sm group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-500 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
