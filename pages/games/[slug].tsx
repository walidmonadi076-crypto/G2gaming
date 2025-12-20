
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getGameBySlug, getAllGames, getRelatedGames, getTrendingGames } from '../../lib/data';
import type { Game } from '../../types';
import Ad from '../../components/Ad';
import SEO from '../../components/SEO';
import Lightbox from '../../components/Lightbox';
import GameCard from '../../components/GameCard';
import { getEmbedUrl } from '../../lib/utils';
import HtmlContent from '../../components/HtmlContent';

declare global {
    interface Window { 
        og_load: () => void;
        onLockerUnlock?: () => void;
    }
}

interface GameDetailPageProps { 
    game: Game; 
    similarGames: Game[]; 
    trendingGames: Game[]; 
}

const RecommendedSection = ({ title, subtitle, items, accentColor = "bg-purple-600" }: { title: string, subtitle: string, items: Game[], accentColor?: string }) => {
    if (!items || items.length === 0) return null;
    return (
        <section className="mt-20 border-t border-white/5 pt-12">
            <div className="flex flex-col mb-10">
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-8 ${accentColor} rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]`}></div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{title}</h3>
                </div>
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] ml-5 mt-1">{subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map(item => (
                    <GameCard key={item.id} game={item} />
                ))}
            </div>
        </section>
    );
};

const GameDetailPage: React.FC<GameDetailPageProps> = ({ game, similarGames, trendingGames }) => {
    const router = useRouter();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isOgadsReady, setIsOgadsReady] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const embedUrl = useMemo(() => getEmbedUrl(game.videoUrl), [game.videoUrl]);

    const mediaItems = useMemo(() => {
        const items = [];
        if (game.videoUrl) items.push({ type: 'video' as const, src: game.videoUrl });
        game.gallery.forEach(img => items.push({ type: 'image' as const, src: img }));
        if (items.length === 0 && game.imageUrl) items.push({ type: 'image' as const, src: game.imageUrl });
        return items;
    }, [game]);
    
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    useEffect(() => {
        if (router.isReady && game.slug && process.env.NODE_ENV === 'production') {
            fetch('/api/views/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'games', slug: game.slug }),
            }).catch(console.error);
        }
    }, [router.isReady, game.slug]);

    useEffect(() => {
        window.onLockerUnlock = () => setIsUnlocked(true);
        if (typeof window.og_load === 'function') {
            setIsOgadsReady(true);
        } else {
            const int = setInterval(() => { if (typeof window.og_load === 'function') { setIsOgadsReady(true); clearInterval(int); } }, 200);
            return () => clearInterval(int);
        }
        return () => { delete window.onLockerUnlock; };
    }, []);

    if (router.isFallback) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">Loading...</div>;

    const handleVerificationClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isOgadsReady) window.og_load();
        else alert("Verification service unavailable.");
    };

    return (
        <>
            <SEO title={game.title} description={game.description.replace(/<[^>]*>/g, '').slice(0, 160)} image={game.imageUrl} url={`/games/${game.slug}`} />
            
            <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-purple-500 pb-20 relative">
                {game.backgroundUrl && (
                    <div className="fixed top-0 left-0 w-full h-[800px] z-0">
                        <Image src={game.backgroundUrl} alt="" fill className="object-cover opacity-30" priority />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent" />
                    </div>
                )}

                <div className="relative z-10 max-w-[1400px] mx-auto px-4 pt-8">
                    <div className="mb-8">
                        <Link href={`/games?platform=${game.platform || 'pc'}`} className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                            <span className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-purple-500 group-hover:bg-purple-500/20 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </span>
                            Back to Library
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        <div className="lg:col-span-8 space-y-10">
                            <div className="relative w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                                <button className="w-full h-full relative block cursor-zoom-in" onClick={() => openLightbox(0)}>
                                    {game.videoUrl ? (
                                        embedUrl ? <iframe src={embedUrl} className="w-full h-full pointer-events-none" title={game.title} allow="autoplay; encrypted-media" /> 
                                        : <video src={game.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : <Image src={game.gallery[0] || game.imageUrl} alt={game.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority unoptimized />}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent opacity-80" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/30">{game.category}</span>
                                    {game.tags?.map(tag => <span key={tag} className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-[10px] font-black uppercase tracking-widest border border-gray-700">{tag}</span>)}
                                </div>

                                <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">{game.title}</h1>
                                
                                <div className="bg-gray-900/50 rounded-3xl p-8 border border-white/5 shadow-xl">
                                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        Download Links
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <a href={isUnlocked ? game.downloadUrl : '#'} onClick={!isUnlocked ? handleVerificationClick : undefined} className={`flex-1 group relative rounded-2xl p-[2px] bg-gradient-to-r from-purple-500 to-blue-500 transition-all active:scale-95 ${!isOgadsReady && !isUnlocked ? 'opacity-50 grayscale' : ''}`}>
                                            <div className="bg-gray-900 rounded-[14px] py-4 text-center font-black uppercase tracking-widest text-sm group-hover:bg-transparent transition-colors">
                                                {isUnlocked ? (game.platform === 'mobile' ? 'Download APK' : 'Download Now') : 'Unlock Link'}
                                            </div>
                                        </a>
                                        {game.platform === 'mobile' && (
                                            <a href={isUnlocked ? game.downloadUrlIos : '#'} onClick={!isUnlocked ? handleVerificationClick : undefined} className={`flex-1 group relative rounded-2xl p-[2px] bg-gradient-to-r from-cyan-400 to-blue-600 transition-all active:scale-95 ${!isOgadsReady && !isUnlocked ? 'opacity-50 grayscale' : ''}`}>
                                                <div className="bg-gray-900 rounded-[14px] py-4 text-center font-black uppercase tracking-widest text-sm group-hover:bg-transparent transition-colors">
                                                    {isUnlocked ? 'Download iOS' : 'Unlock iOS Link'}
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                    {!isUnlocked && <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest font-bold">Complete verification to reveal high-speed servers</p>}
                                </div>

                                {game.requirements && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-white/5 py-8">
                                        <div className="bg-gray-900/30 p-4 rounded-xl border border-white/5"><span className="block text-[10px] font-black text-gray-500 uppercase mb-1">OS</span><span className="text-sm font-bold">{game.requirements.os}</span></div>
                                        <div className="bg-gray-900/30 p-4 rounded-xl border border-white/5"><span className="block text-[10px] font-black text-gray-500 uppercase mb-1">Memory</span><span className="text-sm font-bold">{game.requirements.ram}</span></div>
                                        <div className="bg-gray-900/30 p-4 rounded-xl border border-white/5"><span className="block text-[10px] font-black text-gray-500 uppercase mb-1">Storage</span><span className="text-sm font-bold">{game.requirements.storage}</span></div>
                                    </div>
                                )}

                                <section>
                                    <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                                        About This Game
                                    </h2>
                                    <HtmlContent html={game.description} />
                                </section>
                            </div>
                        </div>

                        <aside className="lg:col-span-4 relative space-y-8">
                            <div className="sticky top-24 space-y-8">
                                <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl">
                                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Screenshots</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {game.gallery.slice(0, 4).map((img, index) => (
                                            <button key={index} onClick={() => openLightbox(game.videoUrl ? index + 1 : index)} className="relative aspect-video rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-colors group bg-black">
                                                <Image src={img} alt="" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-center"><Ad placement="game_vertical" className="w-full" /></div>
                            </div>
                        </aside>
                    </div>

                    <RecommendedSection title="Similar Games" subtitle="Explore more in this genre" items={similarGames} />
                    <RecommendedSection title="Trending Now" subtitle="What everyone is playing" items={trendingGames} accentColor="bg-blue-500" />
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
    
    const similar = await getRelatedGames(game.id, game.category);
    const trending = await getTrendingGames(game.id);
    
    return { props: { game, similarGames: similar, trendingGames: trending }, revalidate: 60 };
};

export default GameDetailPage;
