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
            
            <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-purple-500 pb-20 relative overflow-hidden">
                {/* Immersive Background Image from DB */}
                {game.backgroundUrl && (
                    <div className="fixed inset-0 z-0">
                        <Image 
                            src={game.backgroundUrl} 
                            alt="" 
                            fill 
                            className="object-cover opacity-30 blur-[2px]" 
                            priority 
                            unoptimized 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/60 via-[#0d0d0d]/90 to-[#0d0d0d]" />
                    </div>
                )}
                
                {/* Fallback Decor if no backgroundUrl */}
                {!game.backgroundUrl && (
                    <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none z-0" />
                )}

                <div className="relative z-10 max-w-[1600px] mx-auto px-4 pt-8">
                    <div className="mb-8">
                        <Link href="/games" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                            <span className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-purple-500 group-hover:bg-purple-500/20 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </span>
                            Back to Library
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT AD COLUMN */}
                        <aside className="hidden xl:block xl:col-span-2">
                            <div className="sticky top-24">
                                <Ad placement="game_vertical" />
                            </div>
                        </aside>

                        {/* MAIN CONTENT */}
                        <main className="col-span-12 xl:col-span-8 lg:col-span-9 max-w-5xl mx-auto w-full">
                            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">{game.category}</span>
                                        <span className="px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/40 text-blue-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">{game.platform || 'PC'}</span>
                                    </div>
                                    <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl">{game.title}</h1>
                                    <div className="flex items-center gap-4">
                                        <StarRating rating={game.rating ? game.rating / 20 : 0} size="large" />
                                        <span className="text-gray-700 text-xs font-bold uppercase tracking-widest">|</span>
                                        <span className="text-gray-400 text-xs font-black uppercase tracking-widest">
                                            {game.downloadsCount ? game.downloadsCount.toLocaleString() : 0} Players Joined
                                        </span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleActionClick}
                                    className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl transition-all hover:scale-105 shadow-[0_15px_40px_rgba(147,51,234,0.5)] active:scale-95 whitespace-nowrap"
                                >
                                    {isUnlocked ? 'Download Full Version' : 'Access Content Now'}
                                </button>
                            </header>

                            {/* Main Media Visual */}
                            <div className="group relative w-full aspect-video bg-gray-900 rounded-[2.5rem] overflow-hidden mb-12 shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10">
                                {game.videoUrl ? (
                                    embedUrl ? (
                                        <iframe src={embedUrl} className="w-full h-full" title={game.title} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                                    ) : (
                                        <video src={game.videoUrl} controls autoPlay muted className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <Image src={game.imageUrl} alt={game.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" priority unoptimized />
                                )}
                            </div>

                            {/* Middle Ad */}
                            <div className="mb-16 flex justify-center">
                                <Ad placement="game_horizontal" />
                            </div>

                            {/* Description Section */}
                            <section className="mb-20">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-2 h-8 bg-purple-600 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)]"></div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Mission Briefing</h2>
                                </div>
                                <div className="bg-gray-900/40 backdrop-blur-md rounded-[2rem] p-8 md:p-12 border border-white/5">
                                    <HtmlContent html={game.description} />
                                </div>
                            </section>

                            {/* Screenshots Gallery */}
                            {game.gallery && game.gallery.length > 0 && (
                                <section className="mb-20">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Visual Recon</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {game.gallery.map((img, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => { setLightboxIndex(game.videoUrl ? idx + 1 : idx); setLightboxOpen(true); }}
                                                className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500 transition-all group shadow-xl"
                                            >
                                                <Image src={img} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                                                <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Requirements */}
                            {game.requirements && (
                                <section className="mb-20 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-2 h-8 bg-green-600 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)]"></div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">System Specs</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {Object.entries(game.requirements).map(([key, val]) => (
                                            <div key={key} className="space-y-2 group">
                                                <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] group-hover:text-green-500 transition-colors">{key}</span>
                                                <p className="text-white font-bold text-lg">{val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Related Games */}
                            <section className="mt-24 border-t border-white/5 pt-16">
                                <div className="flex items-center gap-4 mb-12">
                                    <div className="w-2 h-10 bg-purple-600 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)]"></div>
                                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Similar Expeditions</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {similarGames.map(sg => <GameCard key={sg.id} game={sg} />)}
                                </div>
                            </section>
                        </main>

                        {/* RIGHT AD COLUMN */}
                        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
                            <div className="sticky top-24 space-y-8">
                                <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Database Record</h4>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400 font-bold uppercase">Stability</span>
                                            <span className="text-xs font-black text-green-400">Stable</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400 font-bold uppercase">Rating</span>
                                            <span className="text-xs font-black text-white">{game.rating || 0}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400 font-bold uppercase">Active</span>
                                            <span className="text-xs font-black text-white">{(game.view_count || 0).toLocaleString()}</span>
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

export const getStaticPaths: GetStaticPaths = async () => {
    const games = await getAllGames();
    return { paths: games.map(g => ({ params: { slug: g.slug } })), fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const game = await getGameBySlug(params?.slug as string);
    if (!game) return { notFound: true };
    const similar = await getRelatedGames(game.id, game.category, 6);
    return { props: { game, similarGames: similar }, revalidate: 60 };
};

export default GameDetailPage;