
import React, { useRef, useState, useEffect } from 'react';
import { Game } from '../types';
import GameCard from './GameCard';

interface GameCarouselProps {
  games: Game[];
  cardVariant?: 'default' | 'vertical' | 'featured';
}

const GameCarousel: React.FC<GameCarouselProps> = ({ games, cardVariant = 'default' }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (el) {
      // Tolerance of 2px to handle sub-pixel rendering issues
      const scrollable = el.scrollWidth > el.clientWidth + 2;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(scrollable && Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
        const handleResize = () => {
            setTimeout(checkScrollability, 150);
        };
        // Initial check
        setTimeout(checkScrollability, 100);
        
        el.addEventListener('scroll', checkScrollability, { passive: true });
        window.addEventListener('resize', handleResize);
        return () => {
            el.removeEventListener('scroll', checkScrollability);
            window.removeEventListener('resize', handleResize);
        };
    }
  }, [games]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.75;
      el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const NavButton: React.FC<{ direction: 'left' | 'right', disabled: boolean }> = ({ direction, disabled }) => {
    const isLeft = direction === 'left';
    return (
      <button
        onClick={() => scroll(direction)}
        disabled={disabled}
        className={`absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full 
                    bg-white/5 backdrop-blur-md border border-white/10 text-white shadow-xl
                    hover:bg-purple-600 hover:border-purple-500 hover:scale-110 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]
                    disabled:opacity-0 disabled:cursor-not-allowed
                    transition-all duration-300 flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    ${isLeft ? '-left-6' : '-right-6'}`}
        aria-label={isLeft ? "Scroll left" : "Scroll right"}
      >
        {isLeft ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        )}
      </button>
    );
  };
  
  // Adjusted width calculations for better density
  const cardWidthClass = cardVariant === 'vertical' 
    ? "w-[40%] sm:w-[28%] md:w-[22%] lg:w-[16.66%]" 
    : "w-[85%] sm:w-[45%] md:w-[30%] lg:w-[23%]"; 

  return (
    <div className="relative group">
      <NavButton direction="left" disabled={!canScrollLeft} />
      <div
        ref={scrollContainerRef}
        // Added py-8 and -my-8 to provide vertical space for hover scale/translate effects without disrupting flow
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-5 py-8 -my-8 no-scrollbar items-stretch px-2 md:px-0"
        style={{ scrollPaddingLeft: '0' }}
      >
        {games.map((game) => (
          <div key={game.id} className={`flex-shrink-0 snap-start ${cardWidthClass}`}>
            <GameCard game={game} variant={cardVariant} />
          </div>
        ))}
      </div>
      <NavButton direction="right" disabled={!canScrollRight} />
    </div>
  );
};

export default GameCarousel;
