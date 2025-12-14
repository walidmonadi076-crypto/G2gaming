
import React from 'react';
import Ad from './Ad';

const SponsoredGameCard: React.FC = () => {
  return (
    <div className="group flex flex-col w-full h-full bg-[#18181b] p-3 rounded-3xl transition-all duration-300 ring-1 ring-purple-500/30 hover:ring-purple-500 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-1">
      {/* 1. Ad Container (Matches GameCard 16:9 aspect) */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-900 shadow-lg mb-3 shrink-0 flex items-center justify-center">
         {/* Background Gradient */}
         <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 z-0" />
         
         {/* Ad Component */}
         <div className="relative z-10 w-full h-full flex items-center justify-center">
             <Ad placement="home_native_game" showLabel={false} className="w-full h-full p-0 bg-transparent border-0 rounded-none shadow-none scale-90" />
         </div>

         {/* Overlay to ensure clicks work if ad script allows, or just visual polish */}
         <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-2xl pointer-events-none z-20"></div>
      </div>

      {/* 2. Info Row (Mimics GameCard Footer) */}
      <div className="flex items-center gap-3 px-1 h-12">
        
        {/* Small Icon Placeholder */}
        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-sm bg-yellow-500/10 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
             </svg>
        </div>

        {/* Title & Category */}
        <div className="flex flex-col flex-grow min-w-0 justify-center h-full">
            <h3 className="text-white font-bold text-sm leading-tight truncate group-hover:text-yellow-400 transition-colors">
                Sponsored
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider truncate bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                    Partner
                </span>
            </div>
        </div>

        {/* Action Button Lookalike */}
        <div className="shrink-0 flex items-center gap-1.5 pl-2">
             <div className="bg-yellow-600/20 border border-yellow-600/50 text-yellow-500 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                Visit
             </div>
        </div>
      </div>
    </div>
  );
};

export default SponsoredGameCard;
