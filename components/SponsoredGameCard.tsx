
import React from 'react';
import Ad from './Ad';

const SponsoredGameCard: React.FC = () => {
  return (
    <div className="group flex flex-col w-full h-full bg-[#0e0e12] p-3 rounded-[32px] transition-all duration-300 ring-1 ring-yellow-500/20 hover:ring-yellow-500/50 hover:-translate-y-1">
      {/* 1. Ad Container */}
      <div className="relative w-full aspect-[16/9] rounded-[24px] overflow-hidden bg-gray-900 shadow-inner mb-4 flex items-center justify-center">
         <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 z-0" />
         <div className="relative z-10 w-full h-full flex items-center justify-center">
             <Ad placement="home_native_game" showLabel={false} className="w-full h-full p-0 bg-transparent border-0 rounded-none shadow-none scale-90" />
         </div>
      </div>

      {/* 2. Middle Section */}
      <div className="flex justify-between items-start mb-5 px-1 gap-2">
         <div className="flex flex-col gap-2 min-w-0 flex-1">
            <h3 className="text-white font-bold text-lg leading-none truncate group-hover:text-yellow-400 transition-colors">
                Sponsored
            </h3>
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wide border border-yellow-500/20 whitespace-nowrap">
                    Promoted
                </span>
            </div>
         </div>
         
         <div className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border-2 border-[#1c1c24] shadow-sm bg-yellow-900/20 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
             </svg>
         </div>
      </div>

      {/* 3. Bottom Section */}
      <div className="flex items-center gap-3 mt-auto">
         <div className="flex items-center gap-2 bg-[#1c1c24] rounded-2xl px-4 py-3 border border-white/5 shrink-0">
            <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-[10px]">
               Ad
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider mb-0.5">Trusted</span>
                <span className="text-xs font-black text-white">Partner</span>
            </div>
         </div>

         <div className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-500 border border-yellow-600/50 rounded-2xl px-4 py-3 flex items-center justify-center gap-2 transition-all">
             <span className="font-black text-sm tracking-wide uppercase">
                Visit
             </span>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
         </div>
      </div>
    </div>
  );
};

export default SponsoredGameCard;
