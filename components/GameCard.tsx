
import React, { useRef, useState, useEffect } from 'react';
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
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Helper to handle play/pause safely
  const handleMouseEnter = () => {
    setIsPlaying(true);
    if (videoRef.current && videoLoaded) {
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
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Pre-load logic can be added here if necessary, but browser 'preload="none"' is efficient
  
  // Dynamic Aspect Ratio based on variant
  const aspectRatioClass = variant === 'vertical' ? 'aspect-[3/4]' : 'aspect-video';

  return (
    <Link 
      href={`/games/${game.slug}`}
      className={`
        group relative block w-full rounded-2xl bg-gray-900 overflow-hidden 
        transition-all duration-300 ease-out 
        hover:z-20 hover:scale-105 hover:-translate-y-1
        ring-0 hover:ring-2 hover:ring-purple-500
        hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]
        ${aspectRatioClass}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Static Thumbnail Image */}
      <Image 
        src={game.imageUrl} 
        alt={game.title} 
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className={`object-cover transition-opacity duration-500 ${isPlaying && videoLoaded ? 'opacity-0' : 'opacity-100'}`}
        priority={variant === 'featured'}
      />

      {/* 2. Video Preview (Hidden until hover) */}
      {game.videoUrl && (
        <video
          ref={videoRef}
          src={game.videoUrl}
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      
      {/* 3. Gradient Overlay (Bottom Fade) - Improves text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      
      {/* 4. Content (Title & Badge) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end h-full">
        
        {/* Category Tag - Slides up slightly on hover */}
        <div className="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 mb-1">
           <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]">
             {game.category}
           </span>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-lg leading-tight tracking-tight drop-shadow-md group-hover:text-purple-100 transition-colors truncate">
          {game.title}
        </h3>
        
        {/* Simple Category Text (Visible when NOT hovering) */}
        <p className="text-gray-400 text-xs font-medium mt-1 group-hover:hidden transition-none">
           {game.category}
        </p>
      </div>
    </Link>
  );
};

export default GameCard;
