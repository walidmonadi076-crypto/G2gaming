
import React from 'react';
import Ad from './Ad';

const SponsoredShopCard: React.FC = () => {
  return (
    <div className="block group cursor-pointer">
      {/* Ad Container Area (Mimics Product Image) */}
      <div className="bg-gray-800 rounded-xl overflow-hidden aspect-square relative mb-3 md:mb-4 border border-yellow-500/20 group-hover:border-yellow-500/50 transition-colors">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
             {/* Using shop_square placement which fits perfectly */}
             <Ad placement="shop_square" showLabel={false} className="w-full h-full bg-transparent border-0 shadow-none scale-90" />
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
        
        {/* Badge */}
        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[9px] font-black uppercase px-2 py-1 rounded shadow-md z-10">
            Ad
        </div>
      </div>
      
      {/* Info Area */}
      <div className="space-y-1">
        <p className="text-[10px] md:text-xs font-bold text-yellow-600 uppercase tracking-wider truncate">Sponsored</p>
        <h3 className="text-sm md:text-lg font-medium text-white truncate group-hover:text-yellow-400 transition-colors">Featured Offer</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 md:pt-2 gap-1 sm:gap-0">
            <p className="text-lg md:text-2xl font-bold text-white tracking-tight opacity-50">---</p>
            <div className="opacity-100 transition-opacity transform">
                <span className="text-xs md:text-sm font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-1">
                    Visit Site 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SponsoredShopCard;
