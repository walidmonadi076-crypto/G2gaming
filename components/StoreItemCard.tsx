
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
    <Link href={`/shop/${product.slug}`} className="block group">
      <div className="bg-gray-800 rounded-xl overflow-hidden aspect-square relative mb-3 md:mb-4">
        {!imageError ? (
            <Image 
              src={product.imageUrl} 
              alt={product.name} 
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)} 
            />
        ) : (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>
      
      <div className="space-y-1">
        <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider truncate">{product.category}</p>
        <h3 className="text-sm md:text-lg font-medium text-white truncate group-hover:text-purple-400 transition-colors">{product.name}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 md:pt-2 gap-1 sm:gap-0">
            <p className="text-lg md:text-2xl font-bold text-white tracking-tight">{product.price}</p>
            <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity transform sm:translate-x-2 sm:group-hover:translate-x-0 duration-300">
                <span className="text-xs md:text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    Buy Now 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default StoreItemCard;
