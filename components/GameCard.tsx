
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
      className="group relative flex flex-col w-full h-full bg-[#1e1e24] rounded-3xl p-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 ring-1 ring-white/5 hover:ring-purple-500/50 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Big Cover Image / Video Container */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-3 bg-gray-900 shrink-0 shadow-lg group-hover:shadow-purple-500/10 transition-all z-0">
        
        {/* A. Video Layer (Background) */}
        {/* We render this BEHIND the image. The image fades out to reveal it. */}
        <div className="absolute inset-0 w-full h-full bg-black z-0">
            {game.videoUrl && isPlaying ? (
              embedUrl ? (
                   <div className="w-full h-full overflow-hidden relative pointer-events-none">
                     {/* SCALING TRICK: Zoom in to 145% to crop out YouTube UI bars completely */}
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
                unoptimized
            />
            ) : (
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
            
            {/* Gradient Overlay for Text Readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* 2. Info Row: Small Icon + Text */}
      <div className="flex flex-row gap-3 items-center px-1">
        
        {/* Small Square Icon (The "tswira sghira") */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-purple-500/50 transition-colors shadow-md">
             {!imageError ? (
                <Image 
                    src={game.imageUrl} 
                    alt="Icon" 
                    fill
                    className="object-cover"
                    unoptimized
                />
             ) : (
                <img src={game.imageUrl || PLACEHOLDER_IMAGE} className="w-full h-full object-cover" />
             )}
        </div>

        {/* Title & Metadata */}
        <div className="flex flex-col flex-grow min-w-0">
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-1 group-hover:text-purple-400 transition-colors">
                {game.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-800/80 px-1.5 py-0.5 rounded">
                    {game.category}
                </span>
            </div>
        </div>
      </div>

      {/* 3. Footer: Rating + Button */}
      <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/5 px-1">
            {/* Rating Pill */}
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-xs font-bold text-gray-300">{rating}% Rating</span>
            </div>

            {/* Price / Download Button */}
            <div className="bg-white text-black text-xs font-black px-4 py-1.5 rounded-full hover:bg-purple-500 hover:text-white transition-colors cursor-pointer shadow-lg group-hover:shadow-purple-500/20">
                GET
            </div>
      </div>
    </Link>
  );
};

export default GameCard;
