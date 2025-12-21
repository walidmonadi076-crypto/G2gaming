import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { Product } from '../../../types';
import Ad from '../../../components/Ad';
import SEO from '../../../components/SEO';
import Lightbox from '../../../components/Lightbox';
import HtmlContent from '../../../components/HtmlContent';
import { getEmbedUrl } from '../../../lib/utils';

const ProductPreviewPage: React.FC = () => {
    const [product, setProduct] = useState<Partial<Product>>({
        name: 'Gear Prototype',
        price: '$0.00',
        imageUrl: 'https://picsum.photos/seed/product-placeholder/400/400',
        videoUrl: '',
        description: '<p>Product features and benefits will appear here.</p>',
        gallery: [],
        url: '#',
        category: 'Gear'
    });
    
    const [mainImage, setMainImage] = useState<string>('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const embedUrl = useMemo(() => getEmbedUrl(product.videoUrl), [product.videoUrl]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'preview-update') {
                const payload = event.data.payload as Partial<Product>;
                setProduct(prev => ({ ...prev, ...payload }));
                if (payload.imageUrl) setMainImage(payload.imageUrl);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const mediaItems = useMemo(() => {
        const items = [];
        if (product.videoUrl) items.push({ type: 'video' as const, src: product.videoUrl });
        (product.gallery || []).forEach(img => items.push({ type: 'image' as const, src: img }));
        if (items.length === 0 && product.imageUrl) items.push({ type: 'image' as const, src: product.imageUrl });
        return items;
    }, [product]);

    const displayMainImage = mainImage || product.imageUrl || 'https://picsum.photos/seed/product-placeholder/400/400';

    return (
        <>
            <SEO title={`Preview: ${product.name}`} noindex={true} />
            <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans selection:bg-green-500 pb-20 relative overflow-hidden">
                <div className="fixed top-0 right-0 w-1/2 h-[600px] bg-gradient-to-b from-green-900/10 to-transparent pointer-events-none z-0" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8">
                    <div className="mb-8 opacity-50">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 cursor-not-allowed inline-flex items-center gap-2">
                             &lt; Back to Store (Disabled)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <button className="relative w-full aspect-square md:aspect-[4/3] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 group ring-1 ring-white/5 hover:ring-green-500/50 transition-all duration-500" onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>
                                {product.videoUrl ? (
                                    embedUrl ? (
                                        <iframe src={embedUrl} className="w-full h-full pointer-events-none" title={product.name} />
                                    ) : (
                                        <video key={product.videoUrl} src={product.videoUrl} autoPlay muted loop className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <Image key={displayMainImage} src={displayMainImage} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/60 via-transparent to-transparent opacity-60" />
                            </button>
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
                                    <button disabled className="group relative flex items-center justify-center w-full py-4 bg-green-500/50 text-black/50 font-black uppercase tracking-widest text-lg rounded-xl cursor-not-allowed">
                                        Buy Now (Disabled)
                                    </button>
                                    <div className="w-full flex justify-center border-t border-white/5 pt-4 mt-6"><Ad placement="shop_square" className="bg-black/20" /></div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-1 h-4 bg-green-500 rounded-full"></span>Overview</h3>
                                <HtmlContent html={product.description || ''} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {lightboxOpen && <Lightbox items={mediaItems} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
        </>
    );
};

export default ProductPreviewPage;