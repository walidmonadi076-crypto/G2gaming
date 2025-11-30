
import React from 'react';
import Link from 'next/link';
import Ad from './Ad';

const QuestBanner: React.FC = () => {
  return (
    <div className="relative w-full my-12 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(147,51,234,0.3)] group border border-purple-500/20">
      {/* Background with Gaming Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-purple-900/40 to-blue-900/40 z-0" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10 z-0"
        style={{ 
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`, 
            backgroundSize: '20px 20px' 
        }} 
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-1">
        
        {/* Left: Quest Info */}
        <div className="flex-1 p-6 md:p-8 flex items-center gap-6">
            <div className="hidden md:flex h-16 w-16 bg-purple-600 rounded-2xl items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.6)] transform group-hover:rotate-12 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
                <span className="inline-block px-3 py-1 mb-2 text-[10px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full animate-pulse">
                    Daily Quest Active
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight italic">
                    Complete Missions & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Earn Rewards</span>
                </h3>
                <p className="text-gray-400 text-sm mt-1 max-w-md">
                    Unlock exclusive in-game content, gift cards, and premium badges by completing simple sponsored tasks.
                </p>
                <div className="mt-4 flex gap-3">
                    <Link 
                        href="/quests"
                        className="px-6 py-2.5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-lg"
                    >
                        Start Quest
                    </Link>
                </div>
            </div>
        </div>

        {/* Right: Ad Slot (Quest Banner Placement) */}
        <div className="w-full lg:w-auto p-4 flex justify-center bg-black/20 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none rounded-b-xl lg:rounded-none">
             <div className="relative">
                 <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                 <Ad placement="home_quest_banner" className="bg-gray-900 border-gray-700 shadow-xl w-[320px] md:w-[728px] h-[90px]" />
             </div>
        </div>

      </div>
    </div>
  );
};

export default QuestBanner;
