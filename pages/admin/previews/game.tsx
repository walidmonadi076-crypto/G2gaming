import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { Game } from '../../../types';
import Ad from '../../../components/Ad';
import SEO from '../../../components/SEO';
import Lightbox from '../../../components/Lightbox';
import StarRating from '../../../components/StarRating';
import HtmlContent from '../../../components/HtmlContent';
import { getEmbedUrl } from '../../../lib/utils';

const GamePreviewPage: React.FC = () => {
    const [game, setGame] = useState<Partial<Game>>({
        title: 'Game Prototype',
        imageUrl: 'https://picsum.photos/seed/placeholder/800/600',
        backgroundUrl: '',
        description: '<p>Game description will render exactly like this in the live environment.</p>',
        tags: [],
        gallery: [],
        downloadUrl: '#',
        rating: 95,
        downloadsCount: 5000,
        category: 'Action',
        // FIX: Change 'PC' to lowercase 'pc' to match 'pc' | 'mobile' | 'web' union type
        platform: 'pc'
    });

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'preview-update') {
                setGame(prev => ({ ...prev, ...event.data.payload }));
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const embedUrl = useMemo(() => getEmbedUrl(game.videoUrl), [game.videoUrl]);

    const mediaItems = useMemo(() => {
        const items = [];
        if (game.videoUrl) items.push({ type: 'video' as const, src: game.videoUrl });
        (game.gallery || []).forEach(img => items.push({ type: 'image' as const, src: img }));
        if (items.length === 0 && game.imageUrl) items.push({ type: 'image' as const, src: game.imageUrl });
        return items;
    }, [game]);
    
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    return (
        <>
            <SEO title={`Preview: ${game.title}`} noindex={true} />
            <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-purple-500 pb-20 relative overflow-x-hidden">
                {/* Immersive Background Logic (Same as visitor page) */}
                {game.backgroundUrl && (
                    <div className="fixed inset-0 z-0">
                        <Image src={game.backgroundUrl} alt="" fill className="object-cover opacity-30 blur-[2px]" priority unoptimized />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/60 via-[#0d0d0d]/90 to-[#0d0d0d]" />
                    </div>
                )}
                {!game.backgroundUrl && (
                    <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none z-0" />
                )}

                <div className="relative z-10 max-w-[1600px] mx-auto px-4 pt-8">
                    <div className="mb-6 opacity-50">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 mb-2">Dev Preview Mode</div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 cursor-not-allowed inline-flex items-center gap-2">
                             &lt; Back to Library (Disabled)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <aside className="hidden xl:block xl:col-span-2">
                            <div className="sticky top-24"><Ad placement="game_vertical" /></div>
                        </aside>

                        <main className="col-span-12 xl:col-span-8 lg:col-span-9 max-w-5xl mx-auto w-full">
                            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">{game.category}</span>
                                        <span className="px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/40 text-blue-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">{game.platform || 'PC'}</span>
                                    </div>
                                    <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">{game.title}</h1>
                                    <div className="flex items-center gap-4">
                                        <StarRating rating={game.rating ? game.rating / 20 : 0} size="large" />
                                        <span className="text-gray-700 text-xs font-bold uppercase tracking-widest">|</span>
                                        <span className="text-gray-400 text-xs font-black uppercase tracking-widest">{(game.downloadsCount || 0).toLocaleString()} Players Joined</span>
                                    </div>
                                </div>
                                
                                <button className="px-10 py-5 bg-purple-600/50 text-white/50 font-black uppercase tracking-widest text-sm rounded-2xl cursor-not-allowed border border-white/10">
                                    Download Disabled in Preview
                                </button>
                            </header>

                            <div className="group relative w-full aspect-video bg-gray-900 rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl border border-white/10">
                                {game.videoUrl ? (
                                    embedUrl ? (
                                        <iframe src={embedUrl} className="w-full h-full" title={game.title} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                                    ) : (
                                        <video key={game.videoUrl} src={game.videoUrl} autoPlay muted loop className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <Image key={game.imageUrl} src={game.imageUrl || 'https://picsum.photos/seed/placeholder/800/600'} alt={game.title || ''} fill className="object-cover" unoptimized />
                                )}
                            </div>

                            <section className="mb-20">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Mission Briefing</h2>
                                </div>
                                <div className="bg-gray-900/40 backdrop-blur-md rounded-[2rem] p-8 md:p-12 border border-white/5">
                                    <HtmlContent html={game.description || ''} />
                                </div>
                            </section>

                            {game.gallery && game.gallery.length > 0 && (
                                <section className="mb-20">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Visual Recon</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {game.gallery.map((img, idx) => (
                                            <button key={idx} onClick={() => openLightbox(game.videoUrl ? idx + 1 : idx)} className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                                                <Image src={img} alt="" fill className="object-cover" unoptimized />
                                                <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </main>

                        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
                            <div className="sticky top-24 space-y-8">
                                <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Database Record</h4>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400 font-bold uppercase">Rating</span>
                                            <span className="text-xs font-black text-white">{game.rating || 0}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400 font-bold uppercase">Size</span>
                                            <span className="text-xs font-black text-purple-400">{game.requirements?.storage || 'Variable'}</span>
                                        </div>
                                    </div>
                                </div>
                                <Ad placement="game_vertical" className="mx-auto" />
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
            {lightboxOpen && <Lightbox items={mediaItems} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
        </>
    );
};

export default GamePreviewPage;