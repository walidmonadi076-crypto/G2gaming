
import React from 'react';
import Image from 'next/image';
import { Product } from '../../types';
import StoreItemCard from '../StoreItemCard'; // Reuse the card component for consistency

interface ProductPreviewProps {
  data: Partial<Product>;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ data }) => {
  const {
    name = 'Product Name',
    price = '$29.99',
    imageUrl = 'https://picsum.photos/seed/product-placeholder/400/400',
    description = 'A detailed and convincing description of the product will be displayed here. Highlight the key features and benefits.',
    gallery = [],
    category = 'Gear',
  } = data;
  
  const mainImage = gallery[0] || imageUrl || 'https://picsum.photos/seed/product-placeholder/400/400';
  const displayGallery = gallery.length > 0 ? gallery : (imageUrl ? [imageUrl] : []);

  // Mock data for the bottom sections in preview
  const mockProducts: Product[] = [
      { id: 101, slug: 'mock-1', name: 'Pro Gaming Headset', price: '$89.99', imageUrl: 'https://picsum.photos/seed/mock1/300/300', category: 'Audio', description: '', gallery: [], url: '#' },
      { id: 102, slug: 'mock-2', name: 'RGB Keyboard', price: '$129.00', imageUrl: 'https://picsum.photos/seed/mock2/300/300', category: 'Peripherals', description: '', gallery: [], url: '#' },
      { id: 103, slug: 'mock-3', name: 'Gaming Mouse', price: '$59.99', imageUrl: 'https://picsum.photos/seed/mock3/300/300', category: 'Peripherals', description: '', gallery: [], url: '#' },
      { id: 104, slug: 'mock-4', name: 'Desk Mat', price: '$29.99', imageUrl: 'https://picsum.photos/seed/mock4/300/300', category: 'Accessories', description: '', gallery: [], url: '#' },
  ];

  const PreviewSection = ({ title, items }: { title: string, items: Product[] }) => (
    <div className="mt-12 border-t border-gray-700 pt-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            {title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map(item => (
                <div key={item.id} className="opacity-80 pointer-events-none transform scale-95">
                    <StoreItemCard product={item} />
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in p-4 bg-[#0d0d0d] min-h-screen">
        
        {/* Breadcrumb Mock */}
        <div className="mb-6 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-4">
            Store / {category} / <span className="text-white">{name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Col: Images */}
            <div className="space-y-4">
                <div className="bg-white rounded-xl overflow-hidden aspect-[4/3] relative w-full p-8 border border-gray-800 flex items-center justify-center">
                   <Image src={mainImage} alt={name || 'Product Preview'} key={mainImage} fill sizes="100vw" className="object-contain" />
                </div>
                {displayGallery.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {displayGallery.map((img, index) => (
                            <div key={index} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-700 relative bg-white">
                                <Image src={img} alt={`Thumb ${index}`} fill className="object-contain p-1" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Col: Info */}
            <div className="flex flex-col">
                 <div className="mb-1 text-xs font-bold text-gray-500 uppercase tracking-widest">G2Gaming Gear</div>
                 <h1 className="text-3xl font-black text-white mb-2 leading-tight">{name}</h1>
                 
                 {/* Mock Rating */}
                 <div className="flex items-center gap-2 mb-6">
                    <div className="flex text-yellow-400 text-sm">★★★★☆</div>
                    <span className="text-xs text-gray-500 font-bold">(12 Reviews)</span>
                 </div>

                 <div className="border-t border-b border-gray-800 py-6 mb-6">
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-red-500">{price}</span>
                        <span className="text-sm text-gray-600 line-through font-bold">
                            {price.includes('$') ? `$${(parseFloat(price.replace('$', '')) * 1.2).toFixed(2)}` : ''}
                        </span>
                    </div>
                 </div>

                 <div className="space-y-4 mb-8">
                    <button className="w-full py-4 bg-[#22c55e] text-white font-black uppercase tracking-widest text-lg rounded-sm shadow-lg">
                        Add to Cart
                    </button>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        In Stock & Ready to Ship
                    </div>
                 </div>

                 <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Overview</h3>
                 <div className="prose prose-invert prose-p:text-gray-400 prose-sm max-w-none">
                     <p>{description}</p>
                 </div>
            </div>
        </div>

        {/* Bottom Sections Preview */}
        <PreviewSection title="Related Products" items={mockProducts} />
        <PreviewSection title="Customers Also Bought" items={[mockProducts[3], mockProducts[0], mockProducts[2], mockProducts[1]]} />
        <PreviewSection title="Others Also Viewed" items={[mockProducts[2], mockProducts[1], mockProducts[3], mockProducts[0]]} />
    </div>
  );
};

export default ProductPreview;
