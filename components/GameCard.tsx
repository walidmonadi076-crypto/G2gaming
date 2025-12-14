
import React, { useRef, useState, useEffect } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback image
  const PLACEHOLDER_IMAGE = "https://picsum.photos/seed/gaming/800/600";
  
  // Clean embed URL for iframes
  const embedUrl = getEmbedUrl(game.videoUrl);

  // Handle Video Playback Reliability
  useEffect(() => {
    if (!embedUrl && videoRef.current) {
        if (isHovered) {
            // Force play on hover
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Auto-play was prevented, likely due to browser policy or quick hover out
                });
            }
        } else {
            // Force pause and reset on leave
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }
  }, [isHovered, embedUrl]);

  // Generate a mock download count based on view_count or ID for consistency
  const downloadCount = game.view_count ? game.view_count * 12 + 500 : (game.id * 1500) + 7000;
  
  const formatCompactNumber = (number: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(number);
  };

  return (
    <Link 
      href={`/games/${game.slug}`}
      className="group flex flex-col w-full h-full bg-[#18181b] p-3 rounded-3xl transition-all duration-300 hover:bg-[#202024] hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-1 ring-1 ring-white/5 hover:ring-purple-500/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setVideoLoaded(false); }}
    >
      {/* 1. Big Cover Image / Video Container (16:9) */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-900 shadow-lg mb-3 shrink-0">
        
        {/* A. Video Layer (Background) */}
        <div className="absolute inset-0 w-full h-full bg-black z-0">
            {game.videoUrl && isHovered && (
              embedUrl ? (
                   <div className="w-full h-full overflow-hidden relative pointer-events-none">
                     <iframe 
                       src={embedUrl}
                       className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover" 
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
                  muted={true} // IMPORTANT: Must be true for autoplay
                  loop
                  playsInline
                  preload="auto"
                  onLoadedData={() => setVideoLoaded(true)}
                  className="w-full h-full object-cover"
                />
              )
            )}
        </div>

        {/* B. Image Layer (Foreground - Fades out when video is ready) */}
        <div className={`absolute inset-0 z-10 transition-opacity duration-500 ease-in-out ${isHovered && videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
            {!imageError ? (
            <Image 
                src={game.imageUrl} 
                alt={game.title} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority={variant === 'featured'}
                onError={() => setImageError(true)}
                unoptimized
            />
            ) : (
            <img 
                src={game.imageUrl || PLACEHOLDER_IMAGE} 
                alt={game.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
            />
            )}
            
            {/* Subtle Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* 2. Info Row (Icon + Text + Downloads) */}
      <div className="flex items-center gap-3 px-1 h-12">
        
        {/* Small Icon (Rounded Square) */}
        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-sm bg-gray-800">
             {!imageError ? (
                <Image src={game.imageUrl} alt="" fill className="object-cover" unoptimized />
             ) : (
                <img src={game.imageUrl || PLACEHOLDER_IMAGE} className="w-full h-full object-cover" />
             )}
        </div>

        {/* Title & Category */}
        <div className="flex flex-col flex-grow min-w-0 justify-center h-full">
            <h3 className="text-white font-bold text-sm leading-tight truncate group-hover:text-purple-400 transition-colors">
                {game.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate bg-white/5 px-1.5 py-0.5 rounded">
                    {game.category}
                </span>
            </div>
        </div>

        {/* Downloads Count (Replaces GET button) */}
        <div className="shrink-0 flex items-center gap-1.5 pl-2 bg-[#27272a] px-2.5 py-1.5 rounded-lg border border-white/5 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 group-hover:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="text-[10px] font-black text-gray-300 group-hover:text-white tracking-wide">
                {formatCompactNumber(downloadCount)}
            </span>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
