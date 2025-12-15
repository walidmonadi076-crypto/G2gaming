
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '../../types';
import StarRating from '../StarRating';

interface ProductPreviewProps {
  data: Partial<Product>;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ data }) => {
  const {
    name = 'Product Name',
    price = '$29.99',
    imageUrl = 'https://picsum.photos/seed/product-placeholder/400/400',
    description = 'A detailed and convincing description of the product will be displayed here.',
    gallery = [],
    category = 'Gear',
    features = {}
  } = data;
  
  const [mainImage, setMainImage] = useState(imageUrl);
  
  useEffect(() => {
      setMainImage(imageUrl || 'https://picsum.photos/seed/product-placeholder/400/400');
  }, [imageUrl]);

  const displayGallery = gallery && gallery.length > 0 ? gallery : (imageUrl ? [imageUrl] : []);
  const availableColors = features.colors && features.colors.length > 0 ? features.colors : ['black', 'white', 'purple'];
  const [selectedColor, setSelectedColor] = useState(availableColors[0]);

  // Mock data for the accessories preview
  const mockAccessory = {
      name: "Suggested Accessory",
      price: "$19.99",
      imageUrl: "https://picsum.photos/seed/accessory/100/100"
  };

  return (
    <div className="bg-[#0d0d0d] min-h-screen text-gray-300 p-4 font-sans animate-fade-in">
        
        {/* Breadcrumb Mock */}
        <div className="border-b border-white/5 pb-4 mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Shop / {category} / <span className="text-white">{name}</span></span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            
            {/* Left: Images */}
            <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="relative w-full aspect-[4/3] bg-white rounded-xl overflow-hidden p-8 flex items-center justify-center border border-gray-800">
                    <span className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded shadow-sm z-10 uppercase tracking-wide">Save 20%</span>
                    <div className="relative w-full h-full">
                        <Image src={mainImage || ''} alt={name || ''} fill className="object-contain" />
                    </div>
                </div>
                {displayGallery.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {displayGallery.map((img, index) => (
                            <button key={index} onClick={() => setMainImage(img)} className={`relative flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden border-2 p-1 ${mainImage === img ? 'border-blue-500' : 'border-gray-700'}`}>
                                <Image src={img} alt={`Thumb ${index}`} fill className="object-contain" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-5 flex flex-col">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">G2Gaming Gear</p>
                <h1 className="text-3xl font-black text-white leading-tight mb-2">{name}</h1>
                <div className="flex items-center gap-2 mb-6">
                    <StarRating rating={4.5} />
                    <span className="text-xs text-gray-500 font-bold">(12)</span>
                </div>

                <div className="mb-6">
                    <p className="text-sm font-bold text-gray-300 mb-2">Color:</p>
                    <div className="flex gap-3">
                        {availableColors.map((color: string) => {
                             const bg = color.trim().toLowerCase();
                             return (
                                <button key={color} onClick={() => setSelectedColor(color)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${selectedColor === color ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: bg }}>
                                    {selectedColor === color && <span className="block w-2 h-2 bg-current rounded-full invert mix-blend-difference" />}
                                </button>
                             )
                        })}
                    </div>
                </div>

                <div className="border-t border-b border-white/5 py-6 mb-6">
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-red-500">{price}</span>
                        <span className="text-lg text-gray-500 line-through decoration-gray-600 font-bold">$99.99</span>
                    </div>
                </div>

                <button className="w-full py-4 bg-[#22c55e] text-white font-black uppercase tracking-widest text-lg rounded-sm shadow-lg mb-3">Add to Cart</button>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Availability: In Stock
                </div>
            </div>
        </div>

        {/* Selected Accessories Section Preview */}
        <div className="mt-16 bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-center text-xl font-bold text-white mb-6">
                {features.sectionTitle || 'Selected Accessories'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {[1, 2].map((i) => (
                    <div key={i} className="flex bg-white rounded-lg overflow-hidden h-24 shadow-sm border border-gray-200 opacity-80">
                        <div className="w-24 relative bg-gray-100 flex-shrink-0 p-2">
                            <Image src={mockAccessory.imageUrl} alt="Acc" fill className="object-contain" />
                        </div>
                        <div className="p-3 flex flex-col justify-between flex-grow">
                            <p className="text-xs font-bold text-black leading-tight">Linked Accessory {i}</p>
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black text-black">{mockAccessory.price}</span>
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded uppercase">Add</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {(!features.accessoryIds || features.accessoryIds.length === 0) && (
                <p className="text-center text-xs text-gray-500 mt-2">(Add Accessory IDs in form to populate this section)</p>
            )}
        </div>

        {/* Description Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/5 pt-12">
            <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Product Description</h4>
                <div className="prose prose-invert prose-sm text-gray-400">
                    <p>{description}</p>
                </div>
            </div>
            <div>
                 <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Specifications</h4>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="border-b border-white/5 pb-2"><span className="block text-gray-500 text-xs">Brand</span><span className="text-white font-bold">G2Gaming</span></div>
                     <div className="border-b border-white/5 pb-2"><span className="block text-gray-500 text-xs">Color</span><span className="text-white font-bold capitalize">{selectedColor}</span></div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default ProductPreview;
