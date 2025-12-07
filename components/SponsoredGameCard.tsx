
import React from 'react';
import Ad from './Ad';

const SponsoredGameCard: React.FC = () => {
  return (
    <div className="group relative block w-full rounded-xl bg-gray-900 overflow-hidden ring-1 ring-purple-500/30 hover:ring-2 hover:ring-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 aspect-[3/4]">
      {/* Content Container - Mimics Game Card Layout */}
      <div className="absolute inset-0 flex flex-col">
        {/* Ad Slot fills the image area - Removed padding/margins */}
        <div className="flex-grow relative bg-gray-800 flex items-center justify-center overflow-hidden">
             {/* Removed pointer-events-none from gradient to ensure clicks work if ad is behind */}
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-50 z-10 pointer-events-none" />
             <Ad placement="home_native_game" showLabel={false} className="w-full h-full p-0 bg-transparent border-0 rounded-none shadow-none" />
        </div>

        {/* Footer Area - Mimics Game Details */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end pointer-events-none z-20">
            {/* Fake Tags */}
            <div className="flex gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-200">
                <span className="inline-block px-1.5 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-widest bg-yellow-600 text-white shadow-lg">
                    Sponsored
                </span>
            </div>
            
            {/* Title */}
            <h3 className="text-gray-300 font-black text-sm uppercase leading-none tracking-tighter drop-shadow-md group-hover:text-white transition-colors truncate">
                Featured Game
            </h3>
        </div>
      </div>
    </div>
  );
};

export default SponsoredGameCard;