
import React from 'react';
import Ad from './Ad';

const SponsoredBlogCard: React.FC = () => {
    return (
        <div className="group relative block w-full bg-[#0e0e12] rounded-2xl overflow-hidden ring-1 ring-yellow-500/20 hover:ring-2 hover:ring-yellow-500 transition-all duration-300 ease-out hover:-translate-y-2 h-full flex flex-col">
            {/* Image Section (Ad Container) */}
            <div className="aspect-[16/9] relative overflow-hidden bg-gray-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black z-0" />
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                     {/* Reusing home_native_game placement as it's a generic native feed ad */}
                     <Ad placement="home_native_game" showLabel={false} className="w-full h-full p-0 bg-transparent border-0 rounded-none shadow-none scale-90" />
                </div>
                
                {/* Sponsored Badge */}
                <div className="absolute top-4 left-4 z-10">
                     <span className="inline-flex items-center px-3 py-1 bg-yellow-500/90 backdrop-blur-md text-black text-[10px] font-black uppercase tracking-widest rounded shadow-lg skew-x-[-10deg]">
                        <span className="skew-x-[10deg]">Sponsored</span>
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow relative z-10 -mt-6">
                <div className="bg-[#0e0e12] absolute inset-0 transform -skew-y-2 origin-top-left translate-y-6 z-[-1] border-t border-yellow-500/10 transition-colors" />
                
                <h3 className="text-xl md:text-2xl font-black text-white mb-3 uppercase leading-tight tracking-tight group-hover:text-yellow-400 transition-colors line-clamp-2">
                    Partner Content
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow font-medium line-clamp-3">
                    Check out this featured partner content selected just for you. Support G2gaming by visiting our sponsors.
                </p>
                
                <div className="mt-auto flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-500 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                        <span>Promoted</span>
                        <span className="text-yellow-500">•</span>
                        <span>Featured</span>
                    </div>
                    <div className="bg-yellow-600/20 text-yellow-500 px-3 py-1 rounded-full text-[10px]">
                        Ad
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SponsoredBlogCard;
