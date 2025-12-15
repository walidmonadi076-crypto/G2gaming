
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '../../types';
import StoreItemCard from '../StoreItemCard';

interface ProductPreviewProps {
  data: Partial<Product>;
}

// Mock Ad Component for Preview
const MockAd = () => (
    <div className="w-full h-[250px] bg-black/20 rounded-xl flex items-center justify-center border border-white/5 border-dashed">
        <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">Ad Space</span>
    </div>
);

const ProductPreview: React.FC<ProductPreviewProps> = ({ data }) => {
  const {
    name = 'Product Name',
    price = '$29.99',
    imageUrl = 'https://picsum.photos/seed/product-placeholder/400/400',
    description = 'A detailed and convincing description of the product will be displayed here.',
    gallery = [],
    category = 'Gear',
    url = '#',
  } = data;
  
  const [mainImage, setMainImage] = useState(imageUrl);

  useEffect(() => {
      setMainImage(imageUrl || 'https://picsum.photos/seed/product-placeholder/400/400');
  }, [imageUrl]);

  const displayGallery = gallery && gallery.length > 0 ? gallery : (imageUrl ? [imageUrl] : []);

  // Mock Products for Bottom Sections
  const mockProducts: Product[] = [
      { id: 101, slug: 'mock-1', name: 'Pro Gaming Headset', price: '$89.99', imageUrl: 'https://picsum.photos/seed/mock1/300/300', category: 'Audio', description: '', gallery: [], url: '#' },
      { id: 102, slug: 'mock-2', name: 'RGB Keyboard', price: '$129.00', imageUrl: 'https://picsum.photos/seed/mock2/300/300', category: 'Peripherals', description: '', gallery: [], url: '#' },
      { id: 103, slug: 'mock-3', name: 'Gaming Mouse', price: '$59.99', imageUrl: 'https://picsum.photos/seed/mock3/300/300', category: 'Peripherals', description: '', gallery: [], url: '#' },
      { id: 104, slug: 'mock-4', name: 'Desk Mat', price: '$29.99', imageUrl: 'https://picsum.photos/seed/mock4/300/300', category: 'Accessories', description: '', gallery: [], url: '#' },
  ];

  const PreviewSection = ({ title, items }: { title: string, items: Product[] }) => (
    <div className="mt-20 border-t border-white/5 pt-10 opacity-75">
        <div className="flex flex-col mb-8">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <span className="w-1.5 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                {title}
            </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pointer-events-none transform scale-95 origin-top-left">
            {items.map(item => (
                <StoreItemCard key={item.id} product={item} />
            ))}
        </div>
    </div>
  );

  return (
    <div className="bg-[#0d0d0d] min-h-screen text-gray-200 p-4 font-sans animate-fade-in selection:bg-green-500 selection:text-white">
        
        {/* Breadcrumb Mock */}
        <div className="border-b border-white/5 pb-4 mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Shop / {category} / <span className="text-white">{name}</span></span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            
            {/* Left: Images */}
            <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center">
                    <Image src={mainImage || ''} alt={name || ''} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/60 via-transparent to-transparent opacity-60" />
                </div>
                {displayGallery.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {displayGallery.map((img, index) => (
                            <button key={index} onClick={() => setMainImage(img)} className={`relative flex-shrink-0 w-20 h-20 bg-gray-800 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-green-500' : 'border-transparent'}`}>
                                <Image src={img} alt={`Thumb ${index}`} fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Info & Buy Box */}
            <div className="lg:col-span-5 flex flex-col">
                <div className="sticky top-4 space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="inline-block px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {category}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4">{name}</h1>
                        <div className="inline-block bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                            <p className="text-4xl md:text-5xl font-bold tracking-tight">{price}</p>
                        </div>
                    </div>

                    {/* Buy Box */}
                    <div className="p-1 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                            <button className="group relative flex items-center justify-center w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest text-lg rounded-xl overflow-hidden shadow-lg transition-all">
                                <span className="relative z-10 flex items-center gap-3">Buy Now</span>
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-3 font-medium uppercase tracking-wider mb-4">Secure Transaction</p>
                            <div className="w-full flex justify-center border-t border-white/5 pt-4">
                                <MockAd />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-green-500 rounded-full"></span> Overview
                        </h3>
                        <div className="prose prose-invert prose-p:text-gray-400 text-sm">
                            <p>{description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Sections Preview */}
        <PreviewSection title="Related Products" items={mockProducts} />
        <PreviewSection title="Others Also Viewed" items={[mockProducts[2], mockProducts[3], mockProducts[0], mockProducts[1]]} />
    </div>
  );
};

export default ProductPreview;
