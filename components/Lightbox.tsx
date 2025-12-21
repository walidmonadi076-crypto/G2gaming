"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { getEmbedUrl } from '../lib/utils';

type MediaItem = {
  type: 'image' | 'video';
  src: string;
};

interface LightboxProps {
  items: MediaItem[];
  startIndex?: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ items, startIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : items.length - 1));
  }, [items.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex < items.length - 1 ? prevIndex + 1 : 0));
  }, [items.length]);

  useEffect(() => {
    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    lightboxRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      const focusableElements = lightboxRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift+Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }

      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement.current?.focus();
    };
  }, [onClose, goToPrevious, goToNext]);

  const currentItem = items[currentIndex];

  if (!currentItem) return null;

  const embedUrl = currentItem.type === 'video' ? getEmbedUrl(currentItem.src) : null;

  return (
    <div 
      ref={lightboxRef}
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center animate-fade-in backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-labelledby="lightbox-heading"
    >
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <h2 id="lightbox-heading" className="sr-only">Image and Video Viewer</h2>
        
        {currentItem.type === 'image' ? (
          <div className="relative w-full h-full">
            <Image
                src={currentItem.src}
                alt={`Lightbox image ${currentIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
            />
          </div>
        ) : (
          embedUrl ? (
             <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                <iframe 
                    src={embedUrl}
                    className="w-full h-full"
                    title="Video Player"
                    allow="autoplay; encrypted-media; fullscreen"
                />
             </div>
          ) : (
            <video
                src={currentItem.src}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
          )
        )}
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-50"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white/80 hover:bg-black/80 hover:text-white transition-all hover:scale-110 border border-white/10 backdrop-blur-md"
            aria-label="Previous"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white/80 hover:bg-black/80 hover:text-white transition-all hover:scale-110 border border-white/10 backdrop-blur-md"
            aria-label="Next"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
      
      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-xs font-bold text-white/80 border border-white/10 backdrop-blur-md">
        {currentIndex + 1} / {items.length}
      </div>
    </div>
  );
};

export default Lightbox;