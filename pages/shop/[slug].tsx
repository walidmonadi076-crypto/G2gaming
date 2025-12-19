
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
import StoreItemCard from '../../components/StoreItemCard';
import HtmlContent from '../../components/HtmlContent';

interface ProductDetailPageProps { product: Product; relatedProducts: Product[]; othersViewed: Product[]; }

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, relatedProducts, othersViewed }) => {
    const router = useRouter();
    const [mainImage, setMainImage] = useState<string>('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const mediaItems = useMemo(() => product.gallery.map(img => ({ type: 'image' as const, src: img })), [product.gallery]);

    useEffect(() => {
        if (router.isReady && product.slug && process.env.NODE_ENV === 'production') {
            fetch('/api/views/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'products', slug: product.slug }),
            }).catch(console.error);
        }
        if (product) setMainImage(product.gallery[0] || product.imageUrl);
    }, [router.isReady, product]);

    if (router.isFallback) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">Loading Gear...</div>;

    const displayMainImage = mainImage || 'https://picsum.photos/seed/product-placeholder/400/400';

    return (
        <>
            <SEO title={product.name} description={product.description.replace(/<[^>]*>/g, '').slice(0, 160)} image={product.imageUrl} url={`/shop/${product.slug}`} />
            
            <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans selection:bg-green-500 pb-20">
                <div className="fixed top-0 right-0 w-1/2 h-[600px] bg-gradient-to-b from-green-900/10 to-transparent pointer-events-none z-0" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8">
                    <div className="mb-8">
                        <Link href="/shop" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                            <span className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-green-500 group-hover:bg-green-500/20 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </span>
                            Back to Store
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <button className="relative w-full aspect-square md:aspect-[4/3] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 group cursor-zoom-in ring-1 ring-white/5 hover:ring-green-500/50 transition-all duration-500" onClick={() => { setLightboxIndex(product.gallery.indexOf(mainImage)); setLightboxOpen(true); }}>
                                <Image src={displayMainImage} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" priority unoptimized />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/60 via-transparent to-transparent opacity-60" />
                            </button>
                            {product.gallery.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
                                    {product.gallery.map((img, index) => (
                                        <button key={index} onClick={() => setMainImage(img)} className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-start ${mainImage === img ? 'border-green-500 shadow-lg scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                                            <Image src={img} alt="" fill className="object-cover" unoptimized />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-5 space-y-8">
                            <div>
                                <span className="inline-block px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{product.category}</span>
                                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">{product.name}</h1>
                                <div className="inline-block bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                                    <p className="text-4xl md:text-5xl font-bold tracking-tight">{product.price}</p>
                                </div>
                            </div>

                            <div className="p-1 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                                <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-center w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest text-lg rounded-xl transition-all hover:scale-[1.02] hover:shadow-2xl">
                                        Buy Now
                                    </a>
                                    <div className="w-full flex justify-center border-t border-white/5 pt-4 mt-6"><Ad placement="shop_square" className="bg-black/20" /></div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-1 h-4 bg-green-500 rounded-full"></span>Overview</h3>
                                <HtmlContent html={product.description} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {lightboxOpen && <Lightbox items={mediaItems} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
        </>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const products = await getAllProducts();
    return { paths: products.map(p => ({ params: { slug: p.slug } })), fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const product = await getProductBySlug(params?.slug as string);
    if (!product) return { notFound: true };
    const all = await getAllProducts();
    const related = all.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
    const viewed = all.filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 4);
    return { props: { product, relatedProducts: related, othersViewed: viewed }, revalidate: 60 };
};

export default ProductDetailPage;
