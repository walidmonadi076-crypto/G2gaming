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

    // PS5 Clock Logic
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
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

    // Meta mapping for the PS5 "Feel"
    const hoursPlayed = Math.floor((game.view_count || 0) / 4) + 5;
    const completionRate = game.rating || 95;

    return (
        <>
            <SEO title={game.title} description={game.description.replace(/<[^>]*>/g, '').slice(0, 160)} image={game.imageUrl} />
            
            <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none">
                
                {/* 1. DYNAMIC BACKGROUND (Video/Image) */}
                <div className="absolute inset-0 z-0 scale-105">
                    <Image 
                        src={game.backgroundUrl || game.imageUrl} 
                        alt="" 
                        fill 
                        className="object-cover opacity-60 brightness-75"
                        priority
                        unoptimized
                    />
                    {/* PS5 Signature Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
                </div>

                {/* 2. PS5 TOP BAR (Site Logo, Search, Settings, Clock) */}
                <header className="relative z-50 flex items-center justify-between px-12 pt-8">
                    <div className="flex items-center gap-12">
                        {/* Site Identity/Logo Area */}
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </div>
                        <nav className="flex items-center gap-10">
                            <span className="text-2xl font-black tracking-tight border-b-4 border-white pb-1">Games</span>
                            <span className="text-2xl font-bold tracking-tight text-white/40 hover:text-white transition-colors cursor-pointer">Media</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-6 text-white/80">
                        <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
                        <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                        <div className="w-10 h-10 rounded-full border-2 border-green-500 overflow-hidden relative">
                             <Image src="https://i.pravatar.cc/100?u=g2gaming" alt="User" fill className="object-cover" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight ml-2">{currentTime}</span>
                    </div>
                </header>

                {/* 3. GAME SWITCHER (Horizontal Strip) */}
                <div className="relative z-40 px-12 mt-10 flex items-center gap-4 overflow-visible">
                    {/* Active Game Icon */}
                    <div className="relative group flex-shrink-0">
                        <div className="w-28 h-28 rounded-[1.8rem] overflow-hidden border-[4px] border-white shadow-[0_0_40px_rgba(255,255,255,0.3)] transform scale-110 z-10 relative">
                            <Image src={game.imageUrl} alt="" fill className="object-cover" unoptimized />
                        </div>
                        {/* Current Label b7al PS5 */}
                        <div className="absolute top-[120%] left-0 whitespace-nowrap">
                            <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">Playing</p>
                            <h2 className="text-lg font-black tracking-tight leading-none">{game.title}</h2>
                        </div>
                    </div>

                    {/* Similar Games as Icons */}
                    {similarGames.slice(0, 7).map((sg) => (
                        <Link key={sg.id} href={`/games/${sg.slug}`} className="flex-shrink-0 w-24 h-24 rounded-[1.5rem] overflow-hidden opacity-30 hover:opacity-100 hover:scale-105 transition-all duration-300 border-2 border-white/5">
                             <Image src={sg.imageUrl} alt="" fill className="object-cover" unoptimized />
                        </Link>
                    ))}

                    {/* Library Icon */}
                    <Link href="/games" className="w-24 h-24 rounded-[1.5rem] bg-white/5 flex items-center justify-center opacity-20 border-2 border-white/5 hover:opacity-50 transition-all">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </Link>
                </div>

                {/* 4. HERO SECTION (Bottom Left) */}
                <div className="absolute left-12 bottom-32 max-w-3xl z-30">
                    <div className="space-y-10 animate-fade-in">
                        {/* Game Logo (Manual icon_url wla Title stylisé) */}
                        <div className="h-48 md:h-56 relative w-full transform -translate-x-3">
                            {game.iconUrl ? (
                                <Image src={game.iconUrl} alt={game.title} fill className="object-contain object-left drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" unoptimized />
                            ) : (
                                <h1 className="text-8xl font-black italic uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">{game.title}</h1>
                            )}
                        </div>

                        {/* Sub-text/Tagline */}
                        <div className="max-w-lg">
                            <p className="text-white/60 text-lg font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-white text-black text-xs font-black rounded">Full Game</span>
                                {game.category} • Online
                            </p>
                            <div className="text-xl text-white/80 line-clamp-2 italic font-medium leading-relaxed">
                                {game.description.replace(/<[^>]*>/g, '').slice(0, 120)}...
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handlePlayClick}
                                className="px-14 py-4 bg-white text-black font-black text-xl rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 group"
                            >
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                Play Game
                            </button>
                            <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-lg">
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 5. SIDE HUD (Info Cards - Right Bottom) */}
                <div className="absolute right-12 bottom-32 flex flex-col gap-6 items-end z-30">
                    
                    {/* Time Counter Widget */}
                    <div className="bg-black/60 backdrop-blur-xl px-6 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl">
                        <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                        <span className="text-xl font-black tracking-tight tabular-nums">{hoursPlayed}h</span>
                    </div>

                    {/* Meta Card (Mimics the Store Card in reference) */}
                    <div className="w-[340px] bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl group hover:bg-white/10 transition-all duration-500">
                        <div className="relative aspect-square">
                            <Image src={game.imageUrl} alt="" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" unoptimized />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <span className="inline-block px-2 py-1 bg-white text-black text-[10px] font-black uppercase rounded mb-2">Community Stats</span>
                                <h4 className="text-xl font-black tracking-tight line-clamp-1">{game.title}</h4>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Active Players</span>
                                        <span className="text-lg font-black">{(game.downloadsCount || 1500).toLocaleString()}</span>
                                    </div>
                                    <div className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-black">
                                        {completionRate}% RATING
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. TROPHY HUD (Bottom HUD Strip) */}
                <div className="absolute left-0 bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent pt-10 pb-8 px-12 flex gap-8 z-40">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6v7a6 6 0 0 0 12 0V2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] leading-none mb-1">Trophies</p>
                            <p className="text-sm font-black uppercase tracking-widest">Top Rated Game</p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/10 self-center"></div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-blue-500 transition-all">
                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] leading-none mb-1">Activity</p>
                            <p className="text-sm font-black uppercase tracking-widest">Trending Now</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Custom Overrides for this page only */}
            <style jsx global>{`
                body { background-color: black; overflow: hidden; }
                main { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
                header { display: none !important; } /* Hide the default site header */
                nav.fixed { display: none !important; } /* Hide the default site sidebar */
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