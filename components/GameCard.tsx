
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
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {});
            }
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }
  }, [isHovered, embedUrl]);

  // Determine Download Count (Manual DB override > Calculated from Views > Default)
  const downloadCount = game.downloadsCount !== undefined && game.downloadsCount !== null 
    ? game.downloadsCount 
    : (game.view_count ? game.view_count * 12 + 500 : (game.id * 1500) + 7000);

  // Determine Rating (Manual DB override > Calculated from ID > Default)
  const rating = game.rating !== undefined && game.rating !== null
    ? game.rating
    : (game.id ? 85 + (game.id % 13) : 98);
  
  const formatCompactNumber = (number: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(number);
  };

  // Determine profile image: explicit icon -> fallback to main image -> fallback to placeholder
  const profileImageSrc = game.iconUrl || game.imageUrl || PLACEHOLDER_IMAGE;

  return (
    <Link 
      href={`/games/${game.slug}`}
      className="group flex flex-col w-full h-full bg-[#0e0e12] p-3 rounded-[32px] transition-all duration-300 hover:bg-[#13131a] hover:-translate-y-1 border border-white/5 hover:border-purple-500/20 hover:shadow-2xl hover:shadow-purple-900/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setVideoLoaded(false); }}
    >
      {/* 1. Cover Media (Top) */}
      <div className="relative w-full aspect-[16/9] rounded-[24px] overflow-hidden bg-gray-900 shadow-inner mb-4">
        
        {/* Video Layer */}
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
                  muted={true}
                  loop
                  playsInline
                  preload="auto"
                  onLoadedData={() => setVideoLoaded(true)}
                  className="w-full h-full object-cover"
                />
              )
            )}
        </div>

        {/* Image Layer */}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* 2. Middle Section: Title + Tags + Icon */}
      <div className="flex justify-between items-start mb-5 px-1 gap-2">
         {/* Left: Text Info */}
         <div className="flex flex-col gap-2 min-w-0 flex-1">
            <h3 className="text-white font-bold text-lg leading-none truncate group-hover:text-purple-400 transition-colors">
                {game.title}
            </h3>
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-[#1c1c24] text-gray-400 text-[10px] font-bold uppercase tracking-wide border border-white/5 whitespace-nowrap">
                    {game.category}
                </span>
                {game.platform === 'mobile' && (
                    <span className="px-3 py-1 rounded-full bg-[#1c1c24] text-purple-400 text-[10px] font-bold uppercase tracking-wide border border-white/5 whitespace-nowrap">
                        Mobile
                    </span>
                )}
            </div>
         </div>
         
         {/* Right: Small Rounded Icon (Uses iconUrl or fallback) */}
         <div className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border-2 border-[#1c1c24] shadow-sm bg-gray-800">
             <Image 
                src={profileImageSrc} 
                alt={`${game.title} icon`} 
                fill 
                className="object-cover" 
                unoptimized 
                onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    if (target.src !== PLACEHOLDER_IMAGE) target.src = PLACEHOLDER_IMAGE;
                }}
             />
         </div>
      </div>

      {/* 3. Bottom Section: Rating & Action Button */}
      <div className="flex items-center gap-3 mt-auto">
         
         {/* Rating Box (Left) */}
         <div className="flex items-center gap-2 bg-[#1c1c24] rounded-2xl px-4 py-3 border border-white/5 shrink-0 group-hover:bg-[#252530] transition-colors">
            <div className="w-5 h-5 rounded-full bg-[#a3e635] flex items-center justify-center text-black shadow-[0_0_10px_rgba(163,230,53,0.4)]">
                {/* Smiley Face Icon */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z"/></svg>
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider mb-0.5">Rating</span>
                <span className="text-xs font-black text-white">{rating}%</span>
            </div>
         </div>

         {/* Action Button (Right) - Styled as 'Price' button but with downloads */}
         <div className="flex-1 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-2xl px-4 py-3 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:-translate-y-0.5">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
             </svg>
             <span className="font-black text-sm tracking-wide">
                {formatCompactNumber(downloadCount)}
             </span>
         </div>

      </div>
    </Link>
  );
};

export default GameCard;
