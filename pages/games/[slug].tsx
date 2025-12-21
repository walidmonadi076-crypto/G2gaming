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
    const [isMounted, setIsMounted] = useState(false); 
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
        setIsMounted(true);
        if (typeof window !== 'undefined' && game.slug) {
            const key = `unlocked_${window.location.pathname}`;
            const unlocked = sessionStorage.getItem(key);
            if (unlocked === 'true') {
                setIsUnlocked(true);
            }
        }
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

    const handleActionClick = (e: React.MouseEvent, targetUrl: string) => {
        if (!isUnlocked) {
            e.preventDefault();
            if (typeof window !== 'undefined' && (window as any).og_load) {
                setTimeout(() => {
                    try { (window as any).og_load(); } catch (err) { console.error("Locker failed:", err); }
                }, 0);
            }
            return;
        }
        window.open(targetUrl, '_blank');
    };

    if (router.isFallback) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white uppercase font-black">Loading...</div>;

    const isMobileGame = game.platform === 'mobile';

    return (
        <>
            <SEO title={game.title} description={game.description?.replace(/<[^>]*>/g, '').slice(0, 160)} image={game.imageUrl} />
            
            <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-purple-500 pb-20 relative overflow-x-hidden" suppressHydrationWarning={true}>
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
                                {game.downloadsCount ? game.downloadsCount.toLocaleString() : 0} Joined
                            </span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                        <div className="col-span-12 lg:col-span-8">
                            <div className="group relative w-full aspect-video bg-gray-900 rounded-[2.5rem] overflow-hidden mb-6 shadow-[0_40px_80px_rgba(0,0,0,0.7)] border border-white/5">
                                {game.videoUrl ? (
                                    embedUrl ? (
                                        <iframe src={embedUrl} className="w-full h-full" title={game.title} allow="autoplay; encrypted-media; fullscreen" />
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
                                    {game.description && <HtmlContent html={game.description.trim()} />}
                                </div>
                            </section>
                        </div>

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
                                                Status: <span suppressHydrationWarning={true}>{!isMounted ? '...' : (isUnlocked ? 'AUTHORIZED' : 'SECURED')}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Integrity</span>
                                            <span suppressHydrationWarning={true} className={`text-[10px] font-black uppercase ${!isMounted ? 'text-gray-500' : (isUnlocked ? 'text-green-400' : 'text-blue-400')}`}>
                                                {!isMounted ? '...' : (isUnlocked ? 'Verified' : 'Verification Required')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {isMounted && (
                                            isMobileGame ? (
                                                <div className="grid grid-cols-1 gap-3">
                                                    <button onClick={(e) => handleActionClick(e, game.downloadUrl)} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-3">
                                                        {isUnlocked ? 'Google Play' : 'Unlock for Android'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={(e) => handleActionClick(e, game.downloadUrl)} className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-[0_15px_30px_rgba(147,51,234,0.4)] flex items-center justify-center gap-3">
                                                    {isUnlocked ? 'Execute Deployment' : 'Initiate Verification'}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {mediaItems.length > 0 && lightboxOpen && <Lightbox items={mediaItems} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
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
    return { props: { game, similarGames: similar || [] }, revalidate: 60 };
};

export default GameDetailPage;