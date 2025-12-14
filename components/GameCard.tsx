
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

  // Fallback image in case the user's URL is dead (404)
  const PLACEHOLDER_IMAGE = "https://picsum.photos/seed/gaming/800/600";

  const embedUrl = getEmbedUrl(game.videoUrl);

  const handleMouseEnter = () => {
    setIsPlaying(true);
    // If it's an MP4 file (not iframe), play it
    if (videoRef.current && !embedUrl) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Auto-play was prevented
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    setVideoLoaded(false); // Reset load state so cover image comes back instantly
    if (videoRef.current && !embedUrl) {
      videoRef.current.pause();
    }
  };

  // Pseudo-random rating generator based on ID for consistency
  const rating = game.id ? 80 + (game.id % 15) : 95;

  // Generate a mock download count
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
      {/* 1. Image/Video Container - Fixed Aspect Ratio */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-gray-900 shrink-0 shadow-lg group-hover:shadow-purple-500/10 transition-all z-0">
        
        {/* A. Video Layer (Background) */}
        {/* We render this BEHIND the image. The image fades out to reveal it. */}
        <div className="absolute inset-0 w-full h-full bg-black z-0">
            {game.videoUrl && isPlaying ? (
              embedUrl ? (
                   <div className="w-full h-full overflow-hidden relative pointer-events-none">
                     {/* SCALING TRICK: Zoom in to 135% to crop out YouTube UI bars */}
                     <iframe 
                       src={embedUrl}
                       className="absolute top-1/2 left-1/2 w-[145%] h-[145%] -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover" 
                       title={game.title}
                       allow="autoplay; encrypted-media"
                       loading="eager"
                       onLoad={() => setVideoLoaded(true)}
                     />
                   </div>
              ) : (
                <video
                  ref={videoRef}
                  src={game.videoUrl}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onLoadedData={() => setVideoLoaded(true)}
                  className="w-full h-full object-cover"
                />
              )
            ) : null}
        </div>

        {/* B. Image Layer (Foreground) */}
        {/* Opacity goes to 0 when playing AND video is loaded */}
        <div className={`absolute inset-0 z-10 transition-opacity duration-500 ease-in-out ${isPlaying && videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
            {!imageError ? (
            <Image 
                src={game.imageUrl} 
                alt={game.title} 
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                priority={variant === 'featured'}
                onError={() => setImageError(true)}
                unoptimized // Ensure we bypass optimization for direct loading
            />
            ) : (
            // Fallback IMG tag: If NextImage fails, this tries to load the raw URL.
            // If the raw URL also fails (onError), it replaces itself with a placeholder.
            <img 
                src={game.imageUrl || PLACEHOLDER_IMAGE} 
                alt={game.title}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== PLACEHOLDER_IMAGE) {
                        target.src = PLACEHOLDER_IMAGE;
                    }
                }}
            />
            )}
            
            {/* Play Icon Removed Completely */}
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="flex flex-col flex-grow relative z-20">
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

        {/* 3. Footer Stats */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
            {/* Rating Pill */}
            <div className="flex items-center gap-2 bg-[#27272a] px-3 py-2 rounded-xl border border-white/5 shadow-sm group-hover:border-white/10 transition-colors">
                <div className="relative w-4 h-4 flex items-center justify-center">
                    <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-pulse"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500 relative z-10" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="text-xs font-bold text-gray-200">{rating}%</span>
            </div>

            {/* Download Button Area */}
            <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                    <span className="block text-sm font-black text-white leading-none tracking-tight">
                        {formatCompactNumber(downloads)}
                    </span>
                    <span className="block text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">
                        Downloads
                    </span>
                </div>
                {/* Big Action Button */}
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
