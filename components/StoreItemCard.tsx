
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '../types';

interface StoreItemCardProps {
  product: Product;
}

const StoreItemCard: React.FC<StoreItemCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Link 
      href={`/shop/${product.slug}`} 
      className="group relative flex flex-col w-full bg-[#16161d] rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-900">
        {!imageError ? (
            <Image 
              src={product.imageUrl} 
              alt={product.name} 
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              onError={() => setImageError(true)} 
            />
        ) : (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
        )}
        
        {/* Overlay Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#16161d] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md text-white rounded border border-white/10 group-hover:border-green-500/50 transition-colors">
                {product.category}
            </span>
        </div>
      </div>
      
      {/* Info Content */}
      <div className="p-4 flex flex-col flex-grow relative">
        {/* Title */}
        <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-1 group-hover:text-green-400 transition-colors">
            {product.name}
        </h3>
        
        {/* Divider */}
        <div className="h-px w-full bg-white/5 my-3 group-hover:bg-green-500/20 transition-colors" />

        {/* Price & CTA */}
        <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Price</span>
                <span className="text-xl font-black text-white tracking-tight">{product.price}</span>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-white border border-white/5 group-hover:bg-green-600 group-hover:text-black group-hover:border-green-500 transition-all duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default StoreItemCard;
