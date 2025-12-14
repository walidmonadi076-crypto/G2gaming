
import React from 'react';
import Ad from './Ad';

const SponsoredShopCard: React.FC = () => {
  return (
    <div className="group relative flex flex-col w-full bg-[#16161d] rounded-2xl overflow-hidden border border-yellow-500/20 transition-all duration-300 hover:border-yellow-500/60 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] hover:-translate-y-1 cursor-pointer">
      {/* Ad Container Area (Mimics Product Image) */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-[#16161d] z-0" />
        
        {/* The Ad Itself */}
        <div className="relative z-10 w-full h-full flex items-center justify-center scale-90">
             <Ad placement="shop_square" showLabel={false} className="w-full h-full bg-transparent border-0 shadow-none" />
        </div>
        
        {/* Badge */}
        <div className="absolute top-3 left-3 z-20">
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-yellow-500 text-black rounded shadow-lg shadow-yellow-500/20">
                Ad
            </span>
        </div>
      </div>
      
      {/* Info Content */}
      <div className="p-4 flex flex-col flex-grow relative">
        <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-1 group-hover:text-yellow-400 transition-colors">
            Featured Partner
        </h3>
        
        <div className="h-px w-full bg-white/5 my-3 group-hover:bg-yellow-500/20 transition-colors" />

        <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Offer</span>
                <span className="text-sm font-black text-gray-300 tracking-tight">Limited Time</span>
            </div>
            
            <div className="h-10 px-4 rounded-xl bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 flex items-center justify-center font-bold text-xs uppercase tracking-wider group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300">
                Visit
            </div>
        </div>
      </div>
    </div>
  );
};

export default SponsoredShopCard;
