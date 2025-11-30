
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getProductBySlug, getAllProducts } from '../../lib/data';
import type { Product } from '../../types';
import Ad from '../../components/Ad';
import SEO from '../../components/SEO';
import Lightbox from '../../components/Lightbox';

interface ProductDetailPageProps { product: Product; }

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product }) => {
    const router = useRouter();
    const [mainImage, setMainImage] = useState<string>('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const mediaItems = useMemo(() => 
        product.gallery.map(img => ({ type: 'image' as const, src: img }))
    , [product.gallery]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    useEffect(() => {
        // Track view on page load
        if (router.isReady && product.slug && process.env.NODE_ENV === 'production') {
            const trackView = async () => {
                try {
                    await fetch('/api/views/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'products', slug: product.slug }),
                    });
                } catch (error) {
                    console.error('Failed to track view:', error);
                }
            };
            trackView();
        }
    }, [router.isReady, product.slug]);

    useEffect(() => {
        if (product) setMainImage(product.gallery[0] || product.imageUrl);
    }, [product]);

    if (router.isFallback) {
        return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">Loading Gear...</div>;
    }

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
    const mainImageIndex = (product.gallery || []).findIndex(img => img === displayMainImage);

    return (
        <>
            <SEO
                title={product.name}
                description={product.description}
                image={product.imageUrl}
                url={`/shop/${product.slug}`}
                schema={productSchema}
            />
            
            <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans selection:bg-green-500 selection:text-white pb-20">
                {/* Background Glow */}
                <div className="fixed top-0 right-0 w-1/2 h-[600px] bg-gradient-to-b from-green-900/10 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link 
                            href="/shop" 
                            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                        >
                            <span className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-green-500 group-hover:bg-green-500/20 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </span>
                            Back to Store
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                        
                        {/* --- LEFT COLUMN: Images --- */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            
                            {/* Main Image Stage */}
                            <button 
                                className="relative w-full aspect-square md:aspect-[4/3] bg-gray-900 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 group cursor-zoom-in ring-1 ring-white/5 hover:ring-green-500/50 transition-all duration-500" 
                                onClick={() => openLightbox(mainImageIndex > -1 ? mainImageIndex : 0)}
                            >
                                {displayMainImage && (
                                    <Image 
                                        src={displayMainImage} 
                                        alt={product.name} 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, 800px" 
                                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                                        priority
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/60 via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-black/50 backdrop-blur-md p-3 rounded-full border border-white/20">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                    </div>
                                </div>
                            </button>

                            {/* Thumbnails */}
                            {(product.gallery && product.gallery.length > 1) && (
                                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
                                    {product.gallery.map((img, index) => (
                                        <button 
                                            key={index} 
                                            onClick={() => setMainImage(img)} 
                                            className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-start ${
                                                mainImage === img 
                                                ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-105' 
                                                : 'border-transparent hover:border-gray-600 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} fill sizes="100px" className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- RIGHT COLUMN: Info & CTA --- */}
                        <div className="lg:col-span-5 flex flex-col h-full">
                            <div className="sticky top-24 space-y-8">
                                
                                {/* Header Info */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="inline-block px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {product.category}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4">
                                        {product.name}
                                    </h1>
                                    <div className="inline-block bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                                        <p className="text-4xl md:text-5xl font-bold tracking-tight">{product.price}</p>
                                    </div>
                                </div>

                                {/* Buy Action */}
                                <div className="p-1 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                                    <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                                        <a 
                                            href={product.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="group relative flex items-center justify-center w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest text-lg rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                                        >
                                            <span className="relative z-10 flex items-center gap-3">
                                                Buy Now
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                            </span>
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        </a>
                                        <p className="text-center text-xs text-gray-500 mt-3 font-medium uppercase tracking-wider">
                                            Secure Transaction via Partner
                                        </p>
                                    </div>
                                </div>

                                {/* Ad Area - Strategically placed under CTA for maximum visibility */}
                                <div className="w-full flex justify-center py-4">
                                    <Ad placement="shop_square" className="shadow-lg" />
                                </div>

                                {/* Description */}
                                <div className="border-t border-white/10 pt-6">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                                        Overview
                                    </h3>
                                    <div className="prose prose-invert prose-p:text-gray-400 prose-p:leading-relaxed max-w-none">
                                        <p>{product.description}</p>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
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

    return {
        props: { product },
        revalidate: 60,
    };
};

export default ProductDetailPage;
