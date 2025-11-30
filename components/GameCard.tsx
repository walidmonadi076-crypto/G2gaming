
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

  // Trigger playback immediately on hover
  const handleMouseEnter = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      // Force reload/play logic
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.debug("Video autoplay prevented or interrupted:", error);
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

  // Dynamic Aspect Ratio based on variant
  const aspectRatioClass = variant === 'vertical' ? 'aspect-[3/4]' : 'aspect-video';

  return (
    <Link 
      href={`/games/${game.slug}`}
      className={`
        group relative block w-full rounded-xl bg-gray-900 overflow-hidden 
        transition-all duration-300 ease-out 
        hover:z-20 hover:scale-105 hover:-translate-y-1
        ring-0 hover:ring-2 hover:ring-purple-500
        hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]
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
        className={`object-cover transition-opacity duration-300 ${isPlaying && videoLoaded ? 'opacity-0' : 'opacity-100'}`}
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
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying && videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      
      {/* 3. Gradient Overlay (Bottom Fade) - Improves text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 4. Content (Title & Badge) - Compact Layout */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end h-full pointer-events-none">
        
        {/* Category Tag - Slides up slightly on hover */}
        <div className="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 mb-1">
           <span className="inline-block px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider bg-purple-600 text-white shadow-[0_0_8px_rgba(147,51,234,0.6)]">
             {game.category}
           </span>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-sm leading-tight tracking-tight drop-shadow-md group-hover:text-purple-100 transition-colors truncate">
          {game.title}
        </h3>
      </div>
    </Link>
  );
};

export default GameCard;
