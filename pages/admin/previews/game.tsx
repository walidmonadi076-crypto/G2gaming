import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Game } from '../../../types';
import Ad from '../../../components/Ad';
import SEO from '../../../components/SEO';
import Lightbox from '../../../components/Lightbox';
import StarRating from '../../../components/StarRating';
import HtmlContent from '../../../components/HtmlContent';
import GameCard from '../../../components/GameCard';
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
        downloadUrlIos: '',
        rating: 95,
        downloadsCount: 5000,
        category: 'Action',
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
    
    const isMobileGame = game.platform === 'mobile';

    return (
        <>
            <SEO title={`Preview: ${game.title}`} noindex={true} />
            <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-purple-500 pb-20 relative overflow-x-hidden">
                {/* Immersive Background */}
                {game.backgroundUrl && (
                    <div className="fixed inset-0 z-0">
                        <Image src={game.backgroundUrl} alt="" fill className="object-cover opacity-20 blur-[3px]" priority unoptimized />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/70 via-[#0d0d0d]/95 to-[#0d0d0d]" />
                    </div>
                )}

                <div className="relative z-10 max-w-[1700px] mx-auto px-4 pt-8">
                    <div className="mb-10 opacity-40">
                         <span className="px-3 py-1 rounded bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest mr-4">DEV PREVIEW</span>
                         <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Library (Disabled)</span>
                    </div>

                    <header className="mb-12 max-w-4xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 rounded-md bg-purple-900/40 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">{game.category || 'Category'}</span>
                            <span className="px-3 py-1 rounded-md bg-blue-900/40 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">{game.platform?.toUpperCase() || 'PC'}</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] drop-shadow-2xl mb-6">{game.title}</h1>
                        <div className="flex items-center gap-6">
                            <StarRating rating={game.rating ? game.rating / 20 : 0} size="large" />
                            <div className="h-4 w-px bg-gray-800"></div>
                            <span className="text-gray-400 text-xs font-black uppercase tracking-[0.1em]">
                                {game.downloadsCount ? game.downloadsCount.toLocaleString() : 0} Players Joined
                            </span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                        
                        <div className="col-span-12 lg:col-span-8">
                            <div className="group relative w-full aspect-video bg-gray-900 rounded-[2rem] overflow-hidden mb-16 shadow-[0_40px_80px_rgba(0,0,0,0.7)] border border-white/5">
                                {game.videoUrl ? (
                                    embedUrl ? (
                                        <iframe src={embedUrl} className="w-full h-full" title={game.title} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                                    ) : (
                                        <video src={game.videoUrl} key={game.videoUrl} controls autoPlay muted className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <Image src={game.imageUrl || 'https://picsum.photos/seed/placeholder/800/600'} alt={game.title || ''} fill className="object-cover" priority unoptimized />
                                )}
                            </div>

                            <section className="mb-20">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-1.5 h-8 bg-purple-600 rounded-full"></div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Intelligence Briefing</h2>
                                </div>
                                <div className="bg-gray-900/30 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/5">
                                    <HtmlContent html={game.description || ''} />
                                    <div className="mt-12 pt-10 border-t border-white/5 flex justify-center">
                                        <div className="w-full max-w-[728px] h-20 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 border-dashed">
                                            <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">In-Content Ad Placement</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {game.gallery && game.gallery.length > 0 && (
                                <section className="mb-20">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Visual Recon</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        {game.gallery.map((img, idx) => (
                                            <div key={idx} className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                                                <Image src={img} alt="" fill className="object-cover" unoptimized />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* SIDEBAR PREVIEW - THE PROFESSIONAL ZONE */}
                        <aside className="col-span-12 lg:col-span-4 space-y-8">
                            <div className="lg:sticky lg:top-8 space-y-8">
                                
                                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                                    
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 relative rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-gray-800 shrink-0">
                                            <Image src={game.iconUrl || game.imageUrl || 'https://picsum.photos/seed/placeholder/100/100'} alt="" fill className="object-cover" unoptimized />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white uppercase leading-none mb-1">Access Terminal</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">System Status: Preview</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Integrity</span>
                                            <span className="text-[10px] font-black uppercase text-green-400">Verified</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Platform</span>
                                            <span className="text-[10px] font-black uppercase text-white">{game.platform?.toUpperCase() || 'PC'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {isMobileGame ? (
                                            <div className="grid grid-cols-1 gap-3">
                                                <button disabled className="w-full py-4 bg-white/50 text-black/50 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-3 cursor-not-allowed">
                                                    Android Link Active (Preview)
                                                </button>
                                                <button disabled className="w-full py-4 bg-gray-700/50 text-white/50 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-3 cursor-not-allowed">
                                                    iOS Link Active (Preview)
                                                </button>
                                            </div>
                                        ) : (
                                            <button disabled className="w-full py-5 bg-purple-600/50 text-white/50 font-black uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
                                                Content Quest Active (Preview)
                                            </button>
                                        )}
                                    </div>
                                    
                                    <p className="mt-6 text-[8px] text-center text-gray-600 uppercase font-black tracking-widest leading-relaxed">
                                        Buttons are disabled in preview mode.
                                    </p>
                                </div>

                                {game.requirements && (
                                    <div className="bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                                            Config Requirements
                                        </h3>
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                            {Object.entries(game.requirements).map(([key, val]) => (
                                                <div key={key}>
                                                    <span className="text-[8px] font-black uppercase text-gray-600 tracking-[0.2em] block mb-1">{key}</span>
                                                    <p className="text-gray-300 font-bold text-xs">{val as string}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex justify-center">
                                     <div className="w-[300px] h-[600px] bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 border-dashed">
                                        <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">Sidebar Ad Slot</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GamePreviewPage;