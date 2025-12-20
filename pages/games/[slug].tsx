import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getGameBySlug, getAllGames, getRelatedGames } from '../../lib/data';
import type { Game } from '../../types';
import SEO from '../../components/SEO';
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
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        setIsLoaded(true);
        return () => clearInterval(timer);
    }, []);

    const handlePlayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (typeof window.og_load === 'function') {
            window.og_load();
        } else {
            window.open(game.downloadUrl, '_blank');
        }
    };

    if (router.isFallback) return <div className="min-h-screen bg-black" />;

    const hoursPlayed = Math.floor((game.view_count || 0) / 4) + 12;
    const completionRate = game.rating || 98;

    return (
        <>
            <SEO title={game.title} description={game.description.replace(/<[^>]*>/g, '').slice(0, 160)} image={game.imageUrl} />
            
            <div className={`min-h-screen bg-black text-white font-sans selection:bg-purple-500 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* 1. FIXED BACKGROUND LAYER */}
                <div className="fixed inset-0 z-0 scale-105 overflow-hidden">
                    <Image 
                        src={game.backgroundUrl || game.imageUrl} 
                        alt="" 
                        fill 
                        className="object-cover opacity-50 brightness-[0.3] transition-transform duration-[20s] animate-slow-zoom"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
                </div>

                {/* 2. DYNAMIC CONTENT WRAPPER */}
                <div className="relative z-10">
                    
                    {/* TOP NAVIGATION */}
                    <header className="flex items-center justify-between px-8 md:px-16 pt-10">
                        <div className="flex items-center gap-14">
                            <button onClick={() => router.push('/games')} className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-xl hover:bg-white/20 transition-all group">
                                 <svg className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <nav className="hidden md:flex items-center gap-12">
                                <Link href="/games" className="text-2xl font-black tracking-tighter border-b-[5px] border-white pb-1.5 px-1">Games</Link>
                                <Link href="/blog" className="text-2xl font-bold tracking-tighter text-white/40 hover:text-white transition-all">Media</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-6 md:gap-8 text-white/80">
                            <button className="p-2 rounded-full hover:bg-white/10 transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
                            <div className="w-11 h-11 rounded-full border-2 border-green-500 overflow-hidden relative shadow-lg">
                                 <Image src="https://i.pravatar.cc/100?u=g2gaming" alt="User" fill className="object-cover" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter tabular-nums">{currentTime}</span>
                        </div>
                    </header>

                    {/* HERO AREA (Dashboard View) */}
                    <div className="px-8 md:px-16 mt-12 flex flex-col min-h-[85vh] justify-between pb-12">
                        
                        {/* Game Strips (Icons) */}
                        <div className="flex items-center gap-5 overflow-visible">
                            <div className="relative group flex-shrink-0">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] overflow-hidden border-[5px] border-white shadow-[0_0_60px_rgba(255,255,255,0.4)] transform scale-110 z-10 relative bg-gray-900">
                                    <Image src={game.imageUrl} alt="" fill className="object-cover" unoptimized />
                                </div>
                                <div className="absolute top-[125%] left-0 whitespace-nowrap">
                                    <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.25em] mb-1">Playing</p>
                                    <h2 className="text-xl font-black tracking-tighter">{game.title}</h2>
                                </div>
                            </div>
                            {similarGames.slice(0, 6).map((sg) => (
                                <Link key={sg.id} href={`/games/${sg.slug}`} className="hidden sm:block flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-[1.8rem] overflow-hidden opacity-30 hover:opacity-100 hover:scale-110 transition-all duration-500 border-2 border-white/5 bg-gray-900">
                                     <Image src={sg.imageUrl} alt="" fill className="object-cover" unoptimized />
                                </Link>
                            ))}
                        </div>

                        {/* Middle Action & Info */}
                        <div className="flex flex-col lg:flex-row items-end lg:items-center justify-between gap-12 mt-20">
                            {/* Left Side: Game Logo & CTA */}
                            <div className="w-full lg:max-w-2xl space-y-10">
                                <div className="h-48 md:h-64 relative w-full transform -translate-x-4">
                                    {game.iconUrl ? (
                                        <Image src={game.iconUrl} alt={game.title} fill className="object-contain object-left drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]" unoptimized />
                                    ) : (
                                        <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)] leading-none">{game.title}</h1>
                                    )}
                                </div>

                                <div className="max-w-xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="px-3 py-1 bg-white text-black text-[11px] font-black uppercase rounded shadow-lg">Full Game</span>
                                        <span className="text-white/60 text-lg font-bold uppercase tracking-widest">{game.category} • Online</span>
                                    </div>
                                    {/* Brief Summary (First 180 chars) */}
                                    <div className="text-xl md:text-2xl text-white/80 line-clamp-2 italic font-medium leading-relaxed mb-8">
                                        {game.description.replace(/<[^>]*>/g, '').slice(0, 180)}...
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <button onClick={handlePlayClick} className="group relative px-16 py-5 bg-white text-black font-black text-2xl rounded-full transition-all shadow-2xl flex items-center gap-5 hover:scale-105 active:scale-95 overflow-hidden">
                                            <span className="relative z-10 flex items-center gap-3">
                                                <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                Play Game
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.2s_infinite]" />
                                        </button>
                                        <button className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-2xl">
                                            <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Stats Panel */}
                            <div className="hidden lg:flex flex-col gap-8 items-end w-[420px]">
                                <div className="bg-black/70 backdrop-blur-3xl px-10 py-4 rounded-3xl border border-white/10 flex items-center gap-5 shadow-2xl self-end">
                                    <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Game Time</span>
                                        <span className="text-3xl font-black tracking-tighter tabular-nums">{hoursPlayed}h</span>
                                    </div>
                                </div>
                                <div className="w-full bg-white/5 backdrop-blur-[60px] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl group hover:bg-white/10 transition-all duration-700">
                                    <div className="relative aspect-square">
                                        <Image src={game.imageUrl} alt="" fill className="object-cover opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" unoptimized />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                        <div className="absolute bottom-10 left-10 right-10">
                                            <span className="inline-block px-4 py-1.5 bg-purple-600 text-white text-[12px] font-black uppercase rounded shadow-2xl mb-4">Official Stats</span>
                                            <h4 className="text-2xl font-black tracking-tighter line-clamp-1 mb-6">{game.title}</h4>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] text-white/40 font-bold uppercase tracking-[0.25em]">Downloads</span>
                                                    <span className="text-3xl font-black">{(game.downloadsCount || 12400).toLocaleString()}</span>
                                                </div>
                                                <div className="px-6 py-2 bg-green-500/20 text-green-400 border-2 border-green-500/30 rounded-2xl text-sm font-black shadow-inner">
                                                    {completionRate}% RATING
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DETAILED DESCRIPTION SECTION (The "Describe" you asked for) */}
                    <section className="relative px-8 md:px-16 py-24 bg-gradient-to-b from-transparent to-black/90">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center gap-6 mb-12 group cursor-default">
                                <div className="w-16 h-16 rounded-[1.25rem] bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xl">
                                     <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-[12px] font-black uppercase text-white/40 tracking-[0.3em] leading-none mb-1.5">Overview</p>
                                    <h3 className="text-4xl font-black uppercase tracking-widest italic">Game Information</h3>
                                </div>
                            </div>

                            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                                {/* RENDERING THE FULL HTML DESCRIPTION FROM DB */}
                                <HtmlContent html={game.description} />

                                {game.requirements && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10">
                                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                                            <span className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Platform / OS</span>
                                            <span className="text-xl font-bold italic">{game.requirements.os}</span>
                                        </div>
                                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                                            <span className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Memory Spec</span>
                                            <span className="text-xl font-bold italic">{game.requirements.ram}</span>
                                        </div>
                                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                                            <span className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Storage req.</span>
                                            <span className="text-xl font-bold italic">{game.requirements.storage}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* TROPHY/ACHIEVEMENT BAR (BOTTOM) */}
                    <div className="w-full bg-gradient-to-t from-black to-transparent pt-24 pb-12 px-16 flex gap-14 border-t border-white/5">
                        <div className="flex items-center gap-6 group cursor-pointer">
                            <div className="w-16 h-16 rounded-[1.25rem] bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-yellow-500 group-hover:text-black transition-all group-hover:scale-110 shadow-2xl">
                                 <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6v7a6 6 0 0 0 12 0V2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                            </div>
                            <div>
                                <p className="text-[12px] font-black uppercase text-white/40 tracking-[0.3em] leading-none mb-1.5">Achievement</p>
                                <p className="text-lg font-black uppercase tracking-widest">Master Level Unlocked</p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <style jsx global>{`
                body { background-color: black; }
                main { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
                header:not(.relative) { display: none !important; }
                nav.fixed { display: none !important; }
                
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                @keyframes slow-zoom { 0% { transform: scale(1.0); } 100% { transform: scale(1.15); } }
                .animate-slow-zoom { animation: slow-zoom 60s infinite alternate ease-in-out; }
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
    const similar = await getRelatedGames(game.id, game.category, 10);
    return { props: { game, similarGames: similar }, revalidate: 60 };
};

export default GameDetailPage;