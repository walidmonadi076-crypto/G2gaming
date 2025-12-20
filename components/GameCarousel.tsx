import React, { useRef, useState, useEffect } from 'react';
import { Game } from '../types';
import GameCard from './GameCard';

interface GameCarouselProps {
  games: Game[];
  cardVariant?: 'default' | 'vertical' | 'featured';
  xmbEffect?: boolean;
}

const GameCarousel: React.FC<GameCarouselProps> = ({ games, cardVariant = 'default', xmbEffect = false }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollable = el.scrollWidth > el.clientWidth + 2;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(scrollable && Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth);

      // XMB Focus Detection
      if (xmbEffect) {
          const containerCenter = el.scrollLeft + el.clientWidth / 2;
          let closestIndex = 0;
          let minDistance = Infinity;

          const children = el.children;
          for (let i = 0; i < children.length; i++) {
              const child = children[i] as HTMLElement;
              const childCenter = child.offsetLeft + child.offsetWidth / 2;
              const distance = Math.abs(containerCenter - childCenter);
              if (distance < minDistance) {
                  minDistance = distance;
                  closestIndex = i;
              }
          }
          setActiveIndex(closestIndex);
      }
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
        const handleResize = () => setTimeout(checkScrollability, 150);
        setTimeout(checkScrollability, 100);
        el.addEventListener('scroll', checkScrollability, { passive: true });
        window.addEventListener('resize', handleResize);
        return () => {
            el.removeEventListener('scroll', checkScrollability);
            window.removeEventListener('resize', handleResize);
        };
    }
  }, [games, xmbEffect]);

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
        className={`absolute top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full 
                    bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-xl
                    hover:bg-purple-600 hover:border-purple-500 hover:scale-110 hover:shadow-[0_0_15px_rgba(147,51,234,0.5)]
                    disabled:opacity-0 disabled:cursor-not-allowed
                    transition-all duration-300 flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    ${isLeft ? '-left-6' : '-right-6'}`}
      >
        {isLeft ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        )}
      </button>
    );
  };
  
  const cardWidthClass = cardVariant === 'vertical' 
    ? "w-[40%] sm:w-[28%] md:w-[22%] lg:w-[16.66%]" 
    : "w-[85%] sm:w-[45%] md:w-[32%] lg:w-[24%]"; 

  return (
    <div className={`relative group px-2 md:px-0 ${xmbEffect ? 'py-10' : ''}`}>
      <NavButton direction="left" disabled={!canScrollLeft} />
      <div
        ref={scrollContainerRef}
        className={`flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 md:gap-6 py-6 -my-6 no-scrollbar items-center
                    ${xmbEffect ? 'mask-gradient-x px-[10%]' : ''}`}
      >
        {games.map((game, index) => (
          <div 
            key={game.id} 
            className={`flex-shrink-0 snap-center transition-all duration-500 ${cardWidthClass}`}
          >
            <GameCard game={game} variant={cardVariant} isFocused={xmbEffect ? activeIndex === index : false} />
          </div>
        ))}
      </div>
      <NavButton direction="right" disabled={!canScrollRight} />
      
      {xmbEffect && (
          <style jsx>{`
            .mask-gradient-x {
                mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            }
          `}</style>
      )}
    </div>
  );
};

export default GameCarousel;