
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

  const aspectRatioClass = 
    variant === 'poster' ? 'aspect-[3/4]' :
    variant === 'vertical' ? 'aspect-[3/4]' : 
    'aspect-video';

  return (
    <Link 
      href={`/games/${game.slug}`}
      className={`
        group relative block w-full rounded-xl bg-gray-900 overflow-hidden 
        transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        hover:z-20 hover:scale-105 hover:-translate-y-1
        ring-0 hover:ring-2 hover:ring-purple-500
        hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]
        ${aspectRatioClass}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Static Thumbnail Image */}
      {!imageError ? (
        <Image 
          src={game.imageUrl} 
          alt={game.title} 
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className={`object-cover transition-opacity duration-300 ${isPlaying && (videoLoaded || embedUrl) ? 'opacity-0' : 'opacity-100'}`}
          priority={variant === 'featured'}
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback to standard img tag for hotlinked/problematic images
        // We use referrerPolicy="no-referrer" to bypass some hotlink protections
        <img 
          src={game.imageUrl} 
          alt={game.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying && (videoLoaded || embedUrl) ? 'opacity-0' : 'opacity-100'}`}
          referrerPolicy="no-referrer"
        />
      )}

      {/* 2. Video Preview */}
      {game.videoUrl && (
        embedUrl ? (
           /* YouTube/Vimeo Iframe - Only load/show on hover to save performance */
           isPlaying && (
             <div className="absolute inset-0 w-full h-full bg-black">
               <iframe 
                 src={embedUrl}
                 className="w-full h-full pointer-events-none" // pointer-events-none ensures click goes to Link
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
      
      {/* 3. Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-300 ${variant === 'poster' ? 'opacity-90' : 'opacity-80 group-hover:opacity-90'} pointer-events-none`} />
      
      {/* 4. Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end h-full pointer-events-none">
        {variant === 'poster' ? (
            <div className="flex flex-col h-full justify-end">
                <div className="absolute top-2 left-2 opacity-100">
                    {game.tags && game.tags.includes('Hot') && <span className="inline-block px-1.5 py-0.5 rounded-[3px] text-[8px] font-black uppercase tracking-widest bg-red-600 text-white shadow-lg">HOT</span>}
                    {game.tags && game.tags.includes('New') && !game.tags.includes('Hot') && <span className="inline-block px-1.5 py-0.5 rounded-[3px] text-[8px] font-black uppercase tracking-widest bg-green-500 text-black shadow-lg">NEW</span>}
                </div>
                <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate">{game.category}</p>
                    <h3 className="text-white font-black text-sm uppercase leading-tight tracking-tight drop-shadow-md line-clamp-2">{game.title}</h3>
                </div>
            </div>
        ) : (
            <>
                <div className="transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 mb-1">
                <span className="inline-block px-1.5 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-widest bg-purple-600 text-white shadow-[0_0_8px_rgba(147,51,234,0.8)]">{game.category}</span>
                </div>
                <h3 className="text-white font-black text-sm uppercase leading-none tracking-tighter drop-shadow-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all truncate">{game.title}</h3>
            </>
        )}
      </div>
    </Link>
  );
};

export default GameCard;
