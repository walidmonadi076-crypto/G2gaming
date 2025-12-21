import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getGameBySlug, getAllGames, getRelatedGames } from '../../lib/data';
import type { Game } from '../../types';
import SEO from '../../components/SEO';
import Ad from '../../components/Ad';
import HtmlContent from '../../components/HtmlContent';
import Lightbox from '../../components/Lightbox';
import StarRating from '../../components/StarRating';
import GameCard from '../../components/GameCard';
import { getEmbedUrl } from '../../lib/utils';

interface GameDetailPageProps { 
    game: Game; 
    similarGames: Game[]; 
}

const GameDetailPage: React.FC<GameDetailPageProps> = ({ game, similarGames }) => {
    const router = useRouter();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isMounted, setIsMounted] = useState(false); // Fix for hydration errors
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const embedUrl = useMemo(() => getEmbedUrl(game.videoUrl), [game.videoUrl]);

    const mediaItems = useMemo(() => {
        const items = [];
        if (game.videoUrl) items.push({ type: 'video' as const, src: game.videoUrl });
        (game.gallery || []).forEach(img => items.push({ type: 'image' as const, src: img }));
        if (items.length === 0 && game.imageUrl) items.push({ type: 'image' as const, src: game.imageUrl });
        return items;
    }, [game]);

    // Check for unlock state and handle mounting
    useEffect(() => {
        setIsMounted(true);
        if (game.slug && typeof window !== 'undefined') {
            const key = `unlocked_${window.location.pathname}`;
            const unlocked = sessionStorage.getItem(key);
            if (unlocked === 'true') {
                setIsUnlocked(true);
            }
        }
    }, [game.slug]);

    // Tracking views
    useEffect(() => {
        if (router.isReady && game.slug && process.env.NODE_ENV === 'production') {
            fetch('/api/views/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'games', slug: game.slug }),
            }).catch(console.error);
        }
    }, [router.isReady, game.slug]);

    const handleActionClick = (e: React.MouseEvent, targetUrl: string) => {
        if (!isUnlocked) {
            // 1. Always stop the default navigation
            e.preventDefault();

            // 2. Safely trigger the OGAds locker
            // Using setTimeout(..., 0) avoids conflicts with React's event loop
            if (typeof window !== 'undefined' && (window as any).og_load) {
                setTimeout(() => {
                    (window as any).og_load();
                }, 0);
            }
            return;
        }
        
        // If already unlocked, proceed normally
        window.open(targetUrl, '_blank');
    };

    if (router.isFallback) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white font-black uppercase tracking-widest">Loading Game Data...</div>;

    const isMobileGame = game.platform === 'mobile';

    return (
        <>
            <SEO title={game.title} description={game.description?.replace(/<[^>]*>/g, '').slice(0, 160)} image={game.imageUrl} />
            
            <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-purple-500 pb-20 relative overflow-x-hidden">
                {/* Immersive Background */}
                {game.backgroundUrl && (
                    <div className="fixed inset-0 z-0">
                        <Image src={game.backgroundUrl} alt="" fill className="object-cover opacity-20 blur-[3px]" priority unoptimized />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/70 via-[#0d0d0d]/95 to-[#0d0d0d]" />
                    </div>
                )}

                <div className="relative z-10 max-w-[1700px] mx-auto px-4 pt-8">
                    <div className="mb-10">
                        <Link href="/games" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                            <span className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-purple-500 group-hover:bg-purple-500/20 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </span>
                            Library
                        </Link>
                    </div>

                    <header className="mb-12 max-w-4xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 rounded-md bg-purple-900/40 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">{game.category}</span>
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
                        
                        {/* LEFT: MAIN CONTENT AREA */}
                        <div className="col-span-12 lg:col-span-8">
                            {/* 1. Main Media Player */}
                            <div className="group relative w-full aspect-video bg-gray-900 rounded-[2.5rem] overflow-hidden mb-6 shadow-[0_40px_80px_rgba(0,0,0,0.7)] border border-white/5">
                                {game.videoUrl ? (
                                    embedUrl ? (
                                        <iframe 
                                            src={embedUrl} 
                                            className="w-full h-full" 
                                            title={game.title} 
                                            allow="autoplay; encrypted-media; fullscreen" 
                                        />
                                    ) : (
                                        <video src={game.videoUrl} controls autoPlay muted className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <Image src={game.imageUrl} alt={game.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" priority unoptimized />
                                )}
                            </div>

                            {/* 2. Compact Gallery */}
                            {game.gallery && game.gallery.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                                    {game.gallery.slice(0, 4).map((img, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => { setLightboxIndex(game.videoUrl ? idx + 1 : idx); setLightboxOpen(true); }}
                                            className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all group shadow-xl"
                                        >
                                            <Image src={img} alt="" fill className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" unoptimized />
                                            {idx === 3 && game.gallery.length > 4 && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                    <span className="text-white font-black text-sm">+{game.gallery.length - 4}</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* 3. Description Section */}
                            <section className="mb-20">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-1.5 h-8 bg-purple-600 rounded-full"></div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Intelligence Briefing</h2>
                                </div>
                                <div className="bg-gray-900/30 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/5">
                                    <HtmlContent html={game.description} />
                                    <div className="mt-12 pt-10 border-t border-white/5 flex justify-center">
                                        <Ad placement="home_quest_banner" className="opacity-50 hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT SIDEBAR: PROFESSIONAL ACTION ZONE */}
                        <aside className="col-span-12 lg:col-span-4 space-y-8">
                            <div className="lg:sticky lg:top-24 space-y-8">
                                
                                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                                    
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 relative rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-gray-800 shrink-0">
                                            <Image src={game.iconUrl || game.imageUrl} alt="" fill className="object-cover" unoptimized />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white uppercase leading-none mb-1">Access Terminal</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                System Status: {isMounted ? (isUnlocked ? 'AUTHORIZED' : 'SECURED') : 'INITIALIZING...'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Integrity</span>
                                            <span className={`text-[10px] font-black uppercase ${isUnlocked ? 'text-green-400' : 'text-blue-400'}`}>
                                                {isUnlocked ? 'Verified' : 'Validation Required'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Platform</span>
                                            <span className="text-[10px] font-black uppercase text-white">{game.platform?.toUpperCase() || 'PC'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {isMounted && (
                                            isMobileGame ? (
                                                <div className="grid grid-cols-1 gap-3">
                                                    <button onClick={(e) => handleActionClick(e, game.downloadUrl)} className={`w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 group`}>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414L20.355 18.1734L18.1734 20.355L15.3414 17.523C14.1565 18.4554 12.6044 19.0026 11 19.0026C6.58172 19.0026 3 15.4209 3 11.0026C3 6.58432 6.58172 3.0026 11 3.0026C15.4183 3.0026 19 6.58432 19 11.0026C19 12.607 18.4528 14.1591 17.5204 15.344L17.523 15.3414ZM11 17.0026C14.3137 17.0026 17 14.3163 17 11.0026C17 7.68889 14.3137 5.0026 11 5.0026C7.68629 5.0026 5 7.68889 5 11.0026C5 14.3163 7.68629 17.0026 11 17.0026Z"/></svg>
                                                        {isUnlocked ? 'Get on Google Play' : 'Unlock for Android'}
                                                    </button>
                                                    <button onClick={(e) => handleActionClick(e, game.downloadUrlIos || '#')} className={`w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3`}>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.96.95-2.04 1.84-3.32 1.84-1.25 0-1.63-.77-3.1-.77-1.45 0-1.92.74-3.11.77-1.28.03-2.45-1.02-3.41-2.41-1.97-2.82-3.41-7.98-1.37-11.53.99-1.74 2.82-2.86 4.82-2.86 1.54 0 2.45.83 3.4 1.25.96.42 1.87 1.25 3.4 1.25s2.44-.83 3.4-1.25c.95-.42 1.86-1.25 3.4-1.25 1.54 0 2.45.83 3.4 1.25 2.01 0 3.84 1.12 4.83 2.86 2.03 3.55.6 8.71-1.37 11.53M12.03 7.25c0-1.89 1.53-3.42 3.43-3.42.06 0 .11 0 .17.01-.02-1.91-1.58-3.44-3.47-3.44-1.89 0-3.42 1.53-3.42 3.42 0 1.89 1.53 3.42 3.42 3.42.06 0 .11 0 .17-.01-.02-1.91-1.58-3.44-3.47-3.44"/></svg>
                                                        {isUnlocked ? 'Get on App Store' : 'Unlock for iOS'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={(e) => handleActionClick(e, game.downloadUrl)} className={`w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-[0_15px_30px_rgba(147,51,234,0.4)] active:scale-95 group flex items-center justify-center gap-3`}>
                                                    {isUnlocked ? 'Execute Deployment' : 'Initiate Verification'}
                                                    <svg xmlns="http://www.w3.org/2000/exports" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                </button>
                                            )
                                        )}
                                    </div>
                                    <p className="mt-6 text-[8px] text-center text-gray-600 uppercase font-black tracking-widest leading-relaxed">
                                        Secure Content Locker Active. Unlocking persists for this session.
                                    </p>
                                </div>

                                {game.requirements && (
                                    <div className="bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                                            Specification
                                        </h3>
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                            {Object.entries(game.requirements).map(([key, val]) => (
                                                <div key={key}>
                                                    <span className="text-[8px] font-black uppercase text-gray-600 tracking-[0.2em] block mb-1">{key}</span>
                                                    <p className="text-gray-300 font-bold text-xs">{val}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="pt-4"><Ad placement="game_vertical" className="mx-auto" /></div>
                            </div>
                        </aside>
                    </div>

                    <section className="mt-32 border-t border-white/5 pt-20">
                        <div className="flex items-center gap-4 mb-16">
                            <div className="w-2 h-10 bg-purple-600 rounded-full"></div>
                            <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Similar Expeditions</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {similarGames.map(sg => <GameCard key={sg.id} game={sg} />)}
                        </div>
                    </section>
                </div>
            </div>

            {lightboxOpen && <Lightbox items={mediaItems} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
        </>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const games = await getAllGames();
    return { paths: games.map(g => ({ params: { slug: g.slug } })), fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const game = await getGameBySlug(params?.slug as string);
    if (!game) return { notFound: true };
    const similar = await getRelatedGames(game.id, game.category, 8);
    return { props: { game, similarGames: similar }, revalidate: 60 };
};

export default GameDetailPage;