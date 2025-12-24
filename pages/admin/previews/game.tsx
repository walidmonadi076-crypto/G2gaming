import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { Game } from '../../../types';
import SEO from '../../../components/SEO';
import StarRating from '../../../components/StarRating';
import HtmlContent from '../../../components/HtmlContent';
import GameCarousel from '../../../components/GameCarousel';
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

    // Mock similar games for preview purposes
    const mockSimilar: Game[] = useMemo(() => [
        { id: 101, slug: 'm1', title: 'Action Quest', imageUrl: 'https://picsum.photos/seed/m1/400/225', category: 'Action', description: '', gallery: [], downloadUrl: '#' },
        { id: 102, slug: 'm2', title: 'Shadow Hunter', imageUrl: 'https://picsum.photos/seed/m2/400/225', category: 'Action', description: '', gallery: [], downloadUrl: '#' },
        { id: 103, slug: 'm3', title: 'Nitro Drift', imageUrl: 'https://picsum.photos/seed/m3/400/225', category: 'Racing', description: '', gallery: [], downloadUrl: '#' },
        { id: 104, slug: 'm4', title: 'Sky Combat', imageUrl: 'https://picsum.photos/seed/m4/400/225', category: 'Action', description: '', gallery: [], downloadUrl: '#' },
    ], []);

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
    
    return (
        <>
            <SEO title={`Preview: ${game.title}`} noindex={true} />
            <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-fredoka selection:bg-purple-500 pb-20 relative overflow-x-hidden">
                {game.backgroundUrl && (
                    <div className="fixed inset-0 z-0">
                        <Image src={game.backgroundUrl} alt="" fill className="object-cover opacity-20 blur-[3px]" priority unoptimized />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/70 via-[#0d0d0d]/95 to-[#0d0d0d]" />
                    </div>
                )}

                <div className="relative z-10 max-w-[1700px] mx-auto px-4 pt-8">
                    <div className="mb-10 opacity-40">
                         <span className="px-3 py-1 rounded bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest mr-4">DEV PREVIEW</span>
                    </div>

                    <header className="mb-12 max-w-4xl">
                        <div className="flex items-center gap-3 mb-6 font-sans">
                            <span className="px-3 py-1 rounded-md bg-purple-900/40 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">{game.category || 'Category'}</span>
                            <span className="px-3 py-1 rounded-md bg-blue-900/40 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">{game.platform?.toUpperCase() || 'PC'}</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-normal text-white uppercase tracking-tighter leading-[0.85] drop-shadow-2xl mb-6">{game.title}</h1>
                        <div className="flex items-center gap-6">
                            <StarRating rating={game.rating ? game.rating / 20 : 0} size="large" />
                            <div className="h-4 w-px bg-gray-800"></div>
                            <span className="text-gray-400 text-xs font-black uppercase tracking-[0.1em] font-sans">
                                {game.downloadsCount ? game.downloadsCount.toLocaleString() : 0} Joined
                            </span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                        <div className="col-span-12 lg:col-span-8">
                            <div className="group relative w-full aspect-video bg-gray-900 rounded-[2.5rem] overflow-hidden mb-6 shadow-[0_40px_80px_rgba(0,0,0,0.7)] border border-white/5">
                                {game.videoUrl ? (
                                    embedUrl ? (
                                        <iframe src={embedUrl} className="w-full h-full" title={game.title} />
                                    ) : (
                                        <video src={game.videoUrl} key={game.videoUrl} controls autoPlay muted className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <Image src={game.imageUrl || 'https://picsum.photos/seed/placeholder/800/600'} alt={game.title || ''} fill className="object-cover" priority unoptimized />
                                )}
                            </div>

                            {/* Gallery Preview Grid */}
                            {game.gallery && game.gallery.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                    {game.gallery.map((img, idx) => (
                                        <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-gray-900 opacity-60">
                                            <Image src={img} alt="" fill className="object-cover" unoptimized />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <section className="mb-20">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-1.5 h-8 bg-purple-600 rounded-full"></div>
                                    <h2 className="text-3xl font-normal text-white uppercase tracking-tight">Intelligence Briefing</h2>
                                </div>
                                <div className="bg-gray-900/30 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 font-sans">
                                    <HtmlContent html={game.description || ''} />
                                </div>
                            </section>
                        </div>

                        <aside className="col-span-12 lg:col-span-4 space-y-8">
                            <div className="lg:sticky lg:top-8 space-y-8">
                                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 relative rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-gray-800 shrink-0">
                                            <Image src={game.iconUrl || game.imageUrl || 'https://picsum.photos/seed/placeholder/100/100'} alt="" fill className="object-cover" unoptimized />
                                        </div>
                                        <div>
                                            <h3 className="font-normal text-white uppercase leading-none mb-1">Access Terminal</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-sans">Status: PREVIEW</p>
                                        </div>
                                    </div>
                                    <button disabled className="w-full py-5 bg-purple-600/50 text-white/50 font-normal uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
                                        Deployment Mode (Preview)
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <section className="mt-32 border-t border-white/5 pt-20">
                        <h3 className="text-4xl md:text-5xl font-normal text-white uppercase mb-16 flex items-center gap-4">
                            <div className="w-2 h-10 bg-purple-600 rounded-full"></div>Similar Expeditions
                        </h3>
                        <GameCarousel games={mockSimilar} />
                    </section>
                </div>
            </div>
        </>
    );
};

export default GamePreviewPage;