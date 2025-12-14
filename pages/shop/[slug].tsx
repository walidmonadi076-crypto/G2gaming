
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getProductBySlug, getAllProducts } from '../../lib/data';
import type { Product } from '../../types';
import SEO from '../../components/SEO';
import Lightbox from '../../components/Lightbox';
import StarRating from '../../components/StarRating';
import StoreItemCard from '../../components/StoreItemCard';
import Ad from '../../components/Ad';

interface ProductDetailPageProps { 
    product: Product;
    relatedProducts: Product[];
    boughtTogether: Product[];
    othersViewed: Product[];
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, relatedProducts, boughtTogether, othersViewed }) => {
    const router = useRouter();
    const [mainImage, setMainImage] = useState<string>('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState<string>('black');

    // UI Mock Data to match screenshot vibe
    const oldPrice = (parseFloat(product.price.replace(/[^0-9.]/g, '')) * 1.22).toFixed(2);
    const savePercent = Math.round(((parseFloat(oldPrice) - parseFloat(product.price.replace(/[^0-9.]/g, ''))) / parseFloat(oldPrice)) * 100);
    const stockCount = 20 + (product.id % 15);
    
    // Mock Ratings if not in DB
    const rating = product.rating || 4.5 + (product.id % 5) / 10;
    const reviewCount = product.reviewsCount || 10 + (product.id * 3);

    const mediaItems = useMemo(() => 
        (product.gallery && product.gallery.length > 0 ? product.gallery : [product.imageUrl]).map(img => ({ type: 'image' as const, src: img }))
    , [product.gallery, product.imageUrl]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    useEffect(() => {
        if (router.isReady && product.slug && process.env.NODE_ENV === 'production') {
            fetch('/api/views/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'products', slug: product.slug }),
            }).catch(console.error);
        }
    }, [router.isReady, product.slug]);

    useEffect(() => {
        setMainImage(product.gallery?.[0] || product.imageUrl);
    }, [product]);

    if (router.isFallback) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">Loading Gear...</div>;

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.imageUrl,
        "description": product.description,
        "offers": {
            "@type": "Offer",
            "url": product.url,
            "priceCurrency": "USD",
            "price": product.price.replace('$', ''),
            "availability": "https://schema.org/InStock"
        }
    };
    
    const displayMainImage = mainImage || 'https://picsum.photos/seed/product-placeholder/400/400';
    const mainImageIndex = mediaItems.findIndex(item => item.src === displayMainImage);

    // Reusable Section Component
    const ProductCarouselSection = ({ title, items, subtitle }: { title: string, items: Product[], subtitle?: string }) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="mt-20 border-t border-white/5 pt-10">
                <div className="flex flex-col mb-8">
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                        {title}
                    </h3>
                    {subtitle && <p className="text-gray-500 text-sm font-bold uppercase tracking-wider ml-5 mt-1">{subtitle}</p>}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {items.slice(0, 4).map(item => (
                        <StoreItemCard key={item.id} product={item} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <SEO title={product.name} description={product.description} image={product.imageUrl} url={`/shop/${product.slug}`} schema={productSchema} />
            
            <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-green-500 selection:text-white pb-20">
                {/* Header Breadcrumb */}
                <div className="border-b border-white/5 bg-[#0d0d0d]">
                    <div className="max-w-[1400px] mx-auto px-4 py-4">
                        <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Store
                        </Link>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                        
                        {/* --- LEFT COLUMN: Images --- */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            {/* Main Image Stage */}
                            <div className="relative w-full aspect-[4/3] bg-white rounded-xl overflow-hidden border border-gray-200 group cursor-zoom-in p-8 flex items-center justify-center">
                                <span className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded shadow-sm z-10 uppercase tracking-wide">
                                    Save {savePercent}%
                                </span>
                                <div className="relative w-full h-full" onClick={() => openLightbox(mainImageIndex > -1 ? mainImageIndex : 0)}>
                                    <Image 
                                        src={displayMainImage} 
                                        alt={product.name} 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, 800px" 
                                        className="object-contain hover:scale-105 transition-transform duration-500" 
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Thumbnails Row */}
                            {(product.gallery && product.gallery.length > 0) && (
                                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                    {product.gallery.map((img, index) => (
                                        <button 
                                            key={index} 
                                            onClick={() => setMainImage(img)} 
                                            className={`relative flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden border-2 transition-all p-1 ${
                                                mainImage === img 
                                                ? 'border-blue-500 ring-2 ring-blue-500/30' 
                                                : 'border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <div className="relative w-full h-full">
                                                <Image src={img} alt={`Thumb ${index}`} fill className="object-contain" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- RIGHT COLUMN: Product Info --- */}
                        <div className="lg:col-span-5 flex flex-col h-full">
                            <div className="space-y-6">
                                {/* Title & Brand */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">G2Gaming Gear</p>
                                    <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                                        {product.name}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={rating} />
                                        <span className="text-xs text-gray-500 font-bold">({reviewCount})</span>
                                    </div>
                                </div>

                                {/* Color Selection (Mock) */}
                                <div>
                                    <p className="text-sm font-bold text-gray-300 mb-2">Color:</p>
                                    <div className="flex gap-3">
                                        {['black', 'white', 'purple'].map(color => (
                                            <button 
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${selectedColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color === 'black' ? '#111' : color === 'white' ? '#eee' : '#7c3aed' }}
                                            >
                                                {selectedColor === color && (
                                                    <svg className={`w-4 h-4 ${color === 'white' ? 'text-black' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Area */}
                                <div className="border-t border-b border-white/5 py-6">
                                    <div className="flex items-baseline gap-3 mb-1">
                                        <span className="text-4xl font-black text-red-500">{product.price}</span>
                                        <span className="text-lg text-gray-500 line-through decoration-gray-600">${oldPrice}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                    </div>
                                </div>

                                {/* CTA Button (Green) */}
                                <div className="space-y-3">
                                    <a 
                                        href={product.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full py-4 bg-[#22c55e] hover:bg-[#16a34a] text-white font-black uppercase tracking-widest text-lg rounded-sm shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        Add to Cart
                                    </a>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Availability: {stockCount}+ left in stock
                                    </div>
                                    <div className="flex gap-4 text-[10px] uppercase font-bold text-gray-500 mt-2">
                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> In Stock</span>
                                        <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Safe payments</span>
                                    </div>
                                </div>
                                
                                {/* Ad Spot inside Product Info */}
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
                                    <Ad placement="shop_square" className="scale-90 opacity-80" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Selected Accessories (Middle Section) --- */}
                    {boughtTogether.length > 0 && (
                        <div className="mt-16 bg-gray-900/50 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-center text-xl font-bold text-white mb-6">Selected Accessories</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                                {boughtTogether.slice(0, 2).map(item => (
                                    <Link href={`/shop/${item.slug}`} key={item.id} className="flex bg-white rounded-lg overflow-hidden h-24 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                                        <div className="w-24 relative bg-gray-100 flex-shrink-0">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="p-3 flex flex-col justify-between flex-grow">
                                            <p className="text-xs font-bold text-black leading-tight line-clamp-2">{item.name}</p>
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-black text-black">{item.price}</span>
                                                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded uppercase hover:bg-blue-700">Add</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- Product Specs & Description (Grid Layout) --- */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Product Description</h4>
                            <h3 className="text-xl font-black text-white mb-4 border-b border-white/10 pb-2 inline-block">Overview</h3>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                {product.description}
                            </p>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                Brand new premium {product.category} designed for gamers. With a variety of hardware and software-based customization options, you can tailor the hardware to your specific gaming needs.
                            </p>
                        </div>
                        
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Specifications</h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                    <div className="border-b border-white/5 pb-2">
                                        <span className="block text-xs text-gray-500 uppercase">Article Number</span>
                                        <span className="text-white font-mono text-sm">33668-{product.id}</span>
                                    </div>
                                    <div className="border-b border-white/5 pb-2">
                                        <span className="block text-xs text-gray-500 uppercase">Manuf. Number</span>
                                        <span className="text-white font-mono text-sm">0711719593</span>
                                    </div>
                                    <div className="border-b border-white/5 pb-2">
                                        <span className="block text-xs text-gray-500 uppercase">Brand</span>
                                        <span className="text-white font-bold text-sm">G2Gaming Official</span>
                                    </div>
                                    <div className="border-b border-white/5 pb-2">
                                        <span className="block text-xs text-gray-500 uppercase">Colour</span>
                                        <span className="text-white font-bold text-sm capitalize">{selectedColor}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-center pt-4">
                                <button className="px-8 py-2 border border-white/20 hover:border-white/50 text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-sm">
                                    Show More Specs
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- Bottom Carousels (New Added Sections) --- */}
                    <ProductCarouselSection title="Related Products" subtitle="You may also like" items={relatedProducts} />
                    <ProductCarouselSection title="Customers Also Bought" subtitle="Frequent combinations" items={boughtTogether} />
                    <ProductCarouselSection title="Others Also Viewed" subtitle="Trending in this category" items={othersViewed} />

                </div>
            </div>

            {lightboxOpen && (
                <Lightbox
                    items={mediaItems}
                    startIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const products = await getAllProducts();
    const paths = products
        .filter(product => product && product.slug && typeof product.slug === 'string')
        .map(product => ({
            params: { slug: product.slug },
        }));
    return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const slug = context.params?.slug as string;
    if (!slug) return { notFound: true };

    const product = await getProductBySlug(slug);
    if (!product) return { notFound: true };

    // Fetch all products to simulate "Related", "Bought Together", "Others Viewed"
    const allProducts = await getAllProducts();
    
    // Filter out current product
    const otherProducts = allProducts.filter(p => p.id !== product.id);
    
    // Helper to shuffle array
    const shuffle = (array: Product[]) => array.sort(() => 0.5 - Math.random());
    
    // 1. Related: Same category
    const related = otherProducts.filter(p => p.category === product.category);
    
    // 2. Bought Together: Random Shuffle
    const bought = shuffle([...otherProducts]);
    
    // 3. Others Viewed: Random Shuffle
    const viewed = shuffle([...otherProducts]);

    return {
        props: { 
            product,
            relatedProducts: related.slice(0, 4),
            boughtTogether: bought.slice(0, 4),
            othersViewed: viewed.slice(0, 4)
        },
        revalidate: 60,
    };
};

export default ProductDetailPage;
