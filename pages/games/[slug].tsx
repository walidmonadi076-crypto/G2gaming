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

declare global {
    interface Window { 
        og_load?: () => void;
        onLockerUnlock?: () => void;
    }
}

interface GameDetailPageProps { 
    game: Game; 
    similarGames: Game[]; 
}

const GameDetailPage: React.FC<GameDetailPageProps> = ({ game, similarGames }) => {
    const router = useRouter();
    const [isUnlocked, setIsUnlocked] = useState(false);
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

    useEffect(() => {
        if (game.slug) {
            const unlocked = sessionStorage.getItem(`unlocked_${game.slug}`);
            if (unlocked === 'true') setIsUnlocked(true);
        }
    }, [game.slug]);

    useEffect(() => {
        window.onLockerUnlock = () => {
            if (game.slug) {
                sessionStorage.setItem(`unlocked_${game.slug}`, 'true');
                setIsUnlocked(true);
            }
        };
        return () => { delete window.onLockerUnlock; };
    }, [game.slug]);

    useEffect(() => {
        if (router.isReady && game.slug && process.env.NODE_ENV === 'production') {
            fetch('/api/views/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'games', slug: game.slug }),
            }).catch(console.error);
        }
    }, [router.isReady, game.slug]);

    const handleActionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isUnlocked) {
            window.open(game.downloadUrl, '_blank');
        } else if (typeof window.og_load === 'function') {
            window.og_load();
        } else {
            window.open(game.downloadUrl, '_blank');
        }
    };

    if (router.isFallback) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white font-black uppercase tracking-widest">Loading Game Data...</div>;

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
                            <span className="px-3 py-1 rounded-md bg-blue-900/40 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">{game.platform || 'PC'}</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] drop-shadow-2xl mb-6">{game.title}</h1>
                        <div className="flex items-center gap-6">
                            <StarRating rating={game.rating ? game.rating / 20 : 0} size="large" />
                            <div className="h-4 w-px bg-gray-800"></div>
                            <span className="text-gray-400 text-xs font-black uppercase tracking-[0.1em]">
                                {game.downloadsCount ? game.downloadsCount.toLocaleString() : 0} Players joined the expedition
                            </span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                        
                        {/* LEFT: MAIN MEDIA & DESCRIPTION */}
                        <div className="col-span-12 lg:col-span-8">
                            <div className="group relative w-full aspect-video bg-gray-900 rounded-[2rem] overflow-hidden mb-16 shadow-[0_40px_80px_rgba(0,0,0,0.7)] border border-white/5">
                                {game.videoUrl ? (
                                    embedUrl ? (
                                        <iframe src={embedUrl} className="w-full h-full" title={game.title} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                                    ) : (
                                        <video src={game.videoUrl} controls autoPlay muted className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <Image src={game.imageUrl} alt={game.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" priority unoptimized />
                                )}
                            </div>

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

                            {game.gallery && game.gallery.length > 0 && (
                                <section className="mb-20">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Visual Recon</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                                        {game.gallery.map((img, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => { setLightboxIndex(game.videoUrl ? idx + 1 : idx); setLightboxOpen(true); }}
                                                className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all group shadow-2xl"
                                            >
                                                <Image src={img} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                                                <div className="absolute inset-0 bg-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* RIGHT: UTILITY SIDEBAR (PROFESSIONAL ZONE) */}
                        <aside className="col-span-12 lg:col-span-4 space-y-8">
                            <div className="lg:sticky lg:top-24 space-y-8">
                                
                                {/* PRIMARY ACTION CARD - NO ADS HERE */}
                                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                                    
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 relative rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-gray-800 shrink-0">
                                            <Image src={game.iconUrl || game.imageUrl} alt="" fill className="object-cover" unoptimized />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white uppercase leading-none mb-1">Access Terminal</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Version 1.0.4 • Stable</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Integrity</span>
                                            <span className="text-[10px] font-black uppercase text-green-400">Verified</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Deployment</span>
                                            <span className="text-[10px] font-black uppercase text-white">Instant</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleActionClick}
                                        className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-[0_15px_30px_rgba(147,51,234,0.4)] active:scale-95 group flex items-center justify-center gap-3"
                                    >
                                        {isUnlocked ? 'Execute Download' : 'Start Content Quest'}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>

                                {/* TECHNICAL SPECS CARD */}
                                {game.requirements && (
                                    <div className="bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                                            Minimum Config
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

                                {/* AD PLACEMENT - DISTANCED FROM BUTTON */}
                                <div className="pt-4">
                                    <Ad placement="game_vertical" className="mx-auto" />
                                </div>

                                <div className="bg-blue-600/5 border border-blue-500/10 rounded-3xl p-6">
                                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Platform Support</h4>
                                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">This content is optimized for {game.platform || 'multiple platforms'}. For the best experience, ensure your system drivers are up to date.</p>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* RELATED GAMES */}
                    <section className="mt-32 border-t border-white/5 pt-20">
                        <div className="flex items-center gap-4 mb-16">
                            <div className="w-2 h-10 bg-purple-600 rounded-full"></div>
                            <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Similar Expeditions</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {similarGames.map(sg => <GameCard key={sg.id} game={sg} />) || <div className="col-span-full h-40 bg-gray-900/50 rounded-3xl animate-pulse"></div>}
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