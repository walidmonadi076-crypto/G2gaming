
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

  // Rating calculation (Cosmetic)
  const rating = game.id ? 80 + (game.id % 15) : 95;

  return (
    <Link 
      href={`/games/${game.slug}`}
      className="group flex flex-col w-full h-full p-2 rounded-2xl transition-all duration-300 hover:bg-[#1e1e24] hover:shadow-2xl hover:shadow-purple-900/10 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setVideoLoaded(false); }}
    >
      {/* 1. Big Cover Image / Video Container (16:9) */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-900 shadow-lg mb-3">
        
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
                className="object-cover"
                priority={variant === 'featured'}
                onError={() => setImageError(true)}
                unoptimized
            />
            ) : (
            <img 
                src={game.imageUrl || PLACEHOLDER_IMAGE} 
                alt={game.title}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
            />
            )}
            
            {/* Subtle Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* 2. Info Row (Icon + Text + Button) */}
      <div className="flex items-center gap-3 px-1">
        
        {/* Small Icon (Rounded Square) */}
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-sm bg-gray-800">
             {!imageError ? (
                <Image src={game.imageUrl} alt="" fill className="object-cover" unoptimized />
             ) : (
                <img src={game.imageUrl || PLACEHOLDER_IMAGE} className="w-full h-full object-cover" />
             )}
        </div>

        {/* Title & Category */}
        <div className="flex flex-col flex-grow min-w-0 justify-center">
            <h3 className="text-white font-bold text-sm sm:text-base leading-tight truncate group-hover:text-purple-400 transition-colors">
                {game.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wide truncate">
                    {game.category}
                </span>
                {/* Rating dots or similar small metadata */}
                <span className="text-[10px] text-green-500 font-bold hidden sm:inline-block">
                    {rating}%
                </span>
            </div>
        </div>

        {/* GET Button */}
        <div className="shrink-0">
            <div className="bg-[#2c2c35] text-blue-400 group-hover:bg-purple-600 group-hover:text-white text-xs font-black px-4 py-1.5 rounded-full transition-all duration-300 uppercase tracking-wider shadow-md">
                GET
            </div>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
