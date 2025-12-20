import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getGameBySlug, getAllGames, getRelatedGames, getTrendingGames } from '../../lib/data';
import type { Game } from '../../types';
import SEO from '../../components/SEO';
import Lightbox from '../../components/Lightbox';
import { getEmbedUrl } from '../../lib/utils';
import HtmlContent from '../../components/HtmlContent';

declare global {
    interface Window { 
        og_load?: () => void;
    }
}

interface GameDetailPageProps { 
    game: Game; 
    similarGames: Game[]; 
}

const GameDetailPage: React.FC<GameDetailPageProps> = ({ game, similarGames }) => {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState('');
    const [isOgadsReady, setIsOgadsReady] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // FIX: Defined openLightbox function to resolve "Cannot find name 'openLightbox'" error.
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // Update Clock like PS5
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const int = setInterval(() => { 
            if (typeof window.og_load === 'function') { 
                setIsOgadsReady(true); 
                clearInterval(int); 
            } 
        }, 500);
        return () => clearInterval(int);
    }, []);

    const handleActionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (typeof window.og_load === 'function') {
            window.og_load();
        } else {
            // Fallback to direct link if OGAds fails to load
            window.open(game.downloadUrl, '_blank');
        }
    };

    if (router.isFallback) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold tracking-tighter">INITIALIZING...</div>;

    // FIX: Explicitly typed mediaItems as a union type to allow both 'image' and 'video' types.
    const mediaItems: { type: 'image' | 'video'; src: string }[] = game.gallery.map(img => ({ type: 'image' as const, src: img }));
    if (game.videoUrl) mediaItems.unshift({ type: 'video' as const, src: game.videoUrl });

    return (
        <>
            <SEO title={game.title} description={game.description.replace(/<[^>]*>/g, '').slice(0, 160)} image={game.imageUrl} />
            
            <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden relative selection:bg-blue-500">
                
                {/* 1. IMMERSIVE BACKGROUND (background_url from DB) */}
                <div className="fixed inset-0 z-0">
                    <Image 
                        src={game.backgroundUrl || game.imageUrl} 
                        alt="" 
                        fill 
                        className="object-cover opacity-60"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
                </div>

                {/* 2. PS5 TOP NAVIGATION BAR */}
                <header className="relative z-50 flex items-center justify-between px-12 py-8">
                    <div className="flex items-center gap-10">
                        <nav className="flex items-center gap-8">
                            <Link href="/games" className="text-2xl font-black tracking-tight border-b-4 border-white pb-1">Games</Link>
                            <Link href="/blog" className="text-2xl font-bold tracking-tight text-white/50 hover:text-white transition-colors">Media</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-8 text-white/90">
                        <button className="hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
                        <button className="hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                        <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-green-500 overflow-hidden relative">
                             <Image src="https://i.pravatar.cc/100?u=admin" alt="User" fill className="object-cover" />
                        </div>
                        <span className="text-2xl font-medium tracking-tight tabular-nums">{currentTime}</span>
                    </div>
                </header>

                {/* 3. GAME ICON CAROUSEL (LFOU9) */}
                <div className="relative z-40 px-12 mt-4 overflow-x-auto no-scrollbar flex items-center gap-4 py-4">
                    {/* Current Game Icon */}
                    <div className="flex-shrink-0 w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-white shadow-[0_0_40px_rgba(255,255,255,0.3)] ring-offset-4 ring-offset-black transition-all">
                        <Image src={game.imageUrl} alt="" width={112} height={112} className="object-cover w-full h-full" unoptimized />
                    </div>
                    {/* Similar Games as Icons */}
                    {similarGames.map(sg => (
                        <Link key={sg.id} href={`/games/${sg.slug}`} className="flex-shrink-0 w-24 h-24 rounded-[1.8rem] overflow-hidden opacity-60 hover:opacity-100 hover:scale-110 transition-all border-2 border-white/10">
                             <Image src={sg.imageUrl} alt="" width={96} height={96} className="object-cover w-full h-full" unoptimized />
                        </Link>
                    ))}
                    <div className="w-24 h-24 rounded-[1.8rem] bg-white/10 flex items-center justify-center opacity-40 border-2 border-white/5">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </div>
                </div>

                <main className="relative z-10 px-12 pt-20">
                    <div className="max-w-[1600px] mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            
                            {/* 4. HERO CONTENT: LOGO & ACTION */}
                            <div className="lg:col-span-8 space-y-10">
                                {/* Game Logo (icon_url) */}
                                <div className="h-48 md:h-64 relative w-full max-w-lg mb-12 transform -translate-x-4">
                                    {game.iconUrl ? (
                                        <Image src={game.iconUrl} alt={game.title} fill className="object-contain object-left drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" unoptimized />
                                    ) : (
                                        <h1 className="text-8xl font-black italic uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">{game.title}</h1>
                                    )}
                                </div>

                                {/* Main Buttons */}
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={handleActionClick}
                                        className="px-16 py-5 bg-white text-black font-black text-2xl rounded-full hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                                    >
                                        Play Game
                                    </button>
                                    <button 
                                        onClick={() => openLightbox(0)}
                                        className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
                                    >
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                    </button>
                                    <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/20">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                    </button>
                                </div>

                                {/* 5. BOTTOM GRID: STATS (Rating & Downloads) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 max-w-2xl">
                                    {/* Trophy Component -> Rating */}
                                    <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10 flex items-center gap-6 hover:bg-white/10 transition-colors">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/40">
                                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6v7a6 6 0 0 0 12 0V2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                                        </div>
                                        <div>
                                            <div className="flex gap-2 mb-1">
                                                {[1,1,1,1].map((_,i) => <div key={i} className="w-4 h-4 rounded-sm bg-blue-400 opacity-80" />)}
                                                <span className="text-sm font-bold opacity-60 ml-1">10</span>
                                            </div>
                                            <h4 className="text-xl font-black uppercase tracking-tight">Player Rating</h4>
                                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{game.rating || 98}% Verified</p>
                                        </div>
                                    </div>

                                    {/* Friends Component -> Downloads */}
                                    <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10 flex items-center gap-6 hover:bg-white/10 transition-colors">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                        </div>
                                        <div>
                                            <div className="flex -space-x-2 mb-1">
                                                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-700 overflow-hidden relative"><Image src={`https://i.pravatar.cc/40?u=${i+10}`} alt="" fill /></div>)}
                                            </div>
                                            <h4 className="text-xl font-black uppercase tracking-tight">Deploys</h4>
                                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{(game.downloadsCount || 1500).toLocaleString()}+ Playing</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 6. SIDEBAR: QUICK INFO (Time played, etc) */}
                            <div className="lg:col-span-4 flex flex-col justify-end items-end pb-12">
                                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                                    <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                                    <span className="text-lg font-black tracking-tight">{Math.floor((game.view_count || 0) / 10) + 12}h Played</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* 7. DETAILED CONTENT (BELOW THE FOLD) */}
                <section className="relative z-20 bg-[#0d0d0f] pt-24 pb-40 mt-32 border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-12 gap-20">
                        {/* Description */}
                        <div className="lg:col-span-8 space-y-12">
                            <div className="flex items-center gap-4">
                                <span className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"></span>
                                <h2 className="text-5xl font-black uppercase italic tracking-tighter">Intelligence Report</h2>
                            </div>
                            <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 shadow-inner">
                                <HtmlContent html={game.description} className="text-gray-400 text-xl leading-relaxed" />
                            </div>

                            {/* Gallery Preview */}
                            <div className="space-y-8">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-white/50">Media Archives</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    {game.gallery.slice(0, 4).map((img, i) => (
                                        <button key={i} onClick={() => openLightbox(game.videoUrl ? i+1 : i)} className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all group">
                                            <Image src={img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Technical Sidebar */}
                        <aside className="lg:col-span-4 space-y-12">
                             {game.requirements && (
                                <div className="bg-[#15151a] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8">System Parameters</h3>
                                    <div className="space-y-6">
                                        {Object.entries(game.requirements).map(([key, value]) => (
                                            <div key={key} className="border-l-2 border-blue-600/30 pl-6 py-1">
                                                <span className="block text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">{key}</span>
                                                <span className="block text-base font-black text-white uppercase">{value as string}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )}
                             <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 rounded-[2.5rem] border border-white/10">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-4">Official Classification</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-bold uppercase">{game.category}</span>
                                    {game.tags?.map(t => <span key={t} className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-bold uppercase text-gray-400">{t}</span>)}
                                </div>
                             </div>
                        </aside>
                    </div>
                </section>

                <footer className="relative z-20 bg-black py-10 text-center border-t border-white/5">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">G2GAMING INFRASTRUCTURE V3.2 • {game.slug.toUpperCase()}</p>
                </footer>
            </div>

            {lightboxOpen && <Lightbox items={mediaItems} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
            
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
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