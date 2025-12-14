
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
    setVideoLoaded(false); // Reset load state to ensure cover image shows immediately
    if (videoRef.current && !embedUrl) {
      videoRef.current.pause();
    }
  };

  // Pseudo-random rating generator based on ID for consistency
  const rating = game.id ? 80 + (game.id % 15) : 95;

  // Generate a mock download count based on view_count or ID
  const downloads = game.view_count ? game.view_count * 12 + 500 : (game.id * 1500) + 7000;
  
  const formatCompactNumber = (number: number) => {
    const formatter = Intl.NumberFormat('en', { notation: "compact", maximumFractionDigits: 1 });
    return formatter.format(number).toLowerCase();
  };

  return (
    <Link 
      href={`/games/${game.slug}`}
      className="group relative flex flex-col w-full h-full bg-[#1e1e24] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 ring-1 ring-white/5 hover:ring-purple-500/50 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Image Container - Fixed Aspect Ratio */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-gray-900 shrink-0 shadow-lg group-hover:shadow-purple-500/10 transition-all z-0">
        
        {/* Static Image (Cover) - Always visible until video is FULLY loaded */}
        <div className={`absolute inset-0 z-20 transition-opacity duration-500 ${isPlaying && videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
            {!imageError ? (
            <Image 
                src={game.imageUrl} 
                alt={game.title} 
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority={variant === 'featured'}
                onError={() => setImageError(true)}
            />
            ) : (
            <img 
                src={game.imageUrl} 
                alt={game.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
            />
            )}
            
            {/* Play Icon Overlay - Only visible when NOT playing */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${isPlaying ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
            </div>
        </div>

        {/* Video Layer - Z-index 10, visible behind image */}
        {game.videoUrl && isPlaying && (
          embedUrl ? (
               <div className="absolute inset-0 w-full h-full bg-black z-10 overflow-hidden">
                 {/* Scale 1.35 crops the YouTube UI bars for a clean look */}
                 <iframe 
                   src={embedUrl}
                   className="w-[135%] h-[135%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
                   title={game.title}
                   allow="autoplay; encrypted-media"
                   loading="lazy"
                   onLoad={() => setTimeout(() => setVideoLoaded(true), 500)} // Small delay to ensure render
                 />
               </div>
          ) : (
            <video
              ref={videoRef}
              src={game.videoUrl}
              muted
              loop
              playsInline
              preload="none"
              onLoadedData={() => setVideoLoaded(true)}
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
          )
        )}
      </div>

      {/* 2. Content Body */}
      <div className="flex flex-col flex-grow relative z-30">
        
        <div className="mb-4">
            <h3 className="text-white font-extrabold text-lg leading-snug line-clamp-1 group-hover:text-purple-400 transition-colors">
                {game.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider bg-gray-800/80 px-2.5 py-1 rounded border border-gray-700/50">
                    {game.category}
                </span>
                {game.tags?.includes('Play on Comet') && (
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 rounded">
                        Comet
                    </span>
                )}
            </div>
        </div>

        {/* 3. Footer Stats - Bigger buttons & better spacing */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
            {/* Rating */}
            <div className="flex items-center gap-2 bg-[#27272a] px-3 py-2 rounded-xl border border-white/5 shadow-sm">
                <div className="relative w-5 h-5 flex items-center justify-center">
                    <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-pulse"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-500 relative z-10" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="text-sm font-bold text-gray-200">{rating}%</span>
            </div>

            {/* Download Counter */}
            <div className="flex items-center gap-3 pl-2">
                <div className="text-right">
                    <span className="block text-[15px] font-black text-white leading-none tracking-tight">
                        {formatCompactNumber(downloads)}
                    </span>
                    <span className="block text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">
                        Downloads
                    </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/20 group-hover:scale-110 group-hover:bg-purple-500 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
