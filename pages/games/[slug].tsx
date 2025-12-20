import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getGameBySlug, getAllGames, getRelatedGames } from '../../lib/data';
import type { Game } from '../../types';
import SEO from '../../components/SEO';

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
    const [currentTime, setCurrentTime] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isOgadsReady, setIsOgadsReady] = useState(false);

    // 1. Persistence Logic
    useEffect(() => {
        if (game.slug) {
            const unlocked = sessionStorage.getItem(`unlocked_${game.slug}`);
            if (unlocked === 'true') {
                setIsUnlocked(true);
            }
        }
    }, [game.slug]);

    // 2. PS5 Clock Logic
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // 3. Locker Logic (OGAds)
    useEffect(() => {
        const handleUnlock = () => {
            if (game.slug) {
                sessionStorage.setItem(`unlocked_${game.slug}`, 'true');
                setIsUnlocked(true);
                // Optional: Force reload if needed for script triggers
                // window.location.reload(); 
            }
        };

        window.onLockerUnlock = handleUnlock;
        
        const int = setInterval(() => { 
            if (typeof window.og_load === 'function') { 
                setIsOgadsReady(true); 
                clearInterval(int); 
            } 
        }, 500);

        return () => { 
            clearInterval(int);
            delete window.onLockerUnlock; 
        };
    }, [game.slug]);

    const handleActionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isUnlocked) {
            window.open(game.downloadUrl, '_blank');
        } else if (typeof window.og_load === 'function') {
            window.og_load();
        } else {
            // Fallback
            window.open(game.downloadUrl, '_blank');
        }
    };

    if (router.isFallback) return <div className="min-h-screen bg-black" />;

    // DB Mapping for Stats
    const hoursPlayed = Math.floor((game.view_count || 0) / 10) + 12;

    return (
        <>
            <SEO title={game.title} description={game.description.replace(/<[^>]*>/g, '').slice(0, 160)} image={game.imageUrl} />
            
            <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none">
                
                {/* 1. IMMERSIVE BACKGROUND (background_url) */}
                <div className="absolute inset-0 z-0">
                    <Image 
                        src={game.backgroundUrl || game.imageUrl} 
                        alt="" 
                        fill 
                        className="object-cover opacity-70"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
                </div>

                {/* 2. PS5 TOP BAR */}
                <header className="relative z-50 flex items-center justify-between px-12 pt-10">
                    <div className="flex items-center gap-12">
                        <nav className="flex items-center gap-10">
                            <span className="text-3xl font-black tracking-tighter border-b-[5px] border-white pb-1.5 px-1 cursor-default">Games</span>
                            <span className="text-3xl font-bold tracking-tighter text-white/40 hover:text-white transition-all cursor-pointer">Media</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-8 text-white/90">
                        <button className="hover:scale-110 transition-transform"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
                        <button className="hover:scale-110 transition-transform"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                        <div className="w-12 h-12 rounded-full border-[3px] border-green-500 overflow-hidden relative shadow-2xl">
                             <Image src="https://i.pravatar.cc/100?u=admin" alt="User" fill className="object-cover" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter tabular-nums">{currentTime}</span>
                    </div>
                </header>

                {/* 3. GAME ICON STRIP (similarGames) */}
                <div className="relative z-40 px-12 mt-8 flex items-end gap-5">
                    {/* Active Icon */}
                    <div className="flex-shrink-0 w-32 h-32 rounded-[2.2rem] overflow-hidden border-[5px] border-white shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all transform scale-110 z-10 bg-gray-900">
                        <Image src={game.imageUrl} alt="" fill className="object-cover" unoptimized />
                    </div>
                    {/* Similar Games as Icons */}
                    {similarGames.slice(0, 10).map(sg => (
                        <Link key={sg.id} href={`/games/${sg.slug}`} className="flex-shrink-0 w-24 h-24 rounded-[1.8rem] overflow-hidden opacity-30 hover:opacity-100 hover:scale-110 transition-all border-2 border-white/5 bg-gray-900">
                             <Image src={sg.imageUrl} alt="" fill className="object-cover" unoptimized />
                        </Link>
                    ))}
                    <div className="w-24 h-24 rounded-[1.8rem] bg-white/10 flex items-center justify-center opacity-20 border-2 border-white/5">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </div>
                </div>

                {/* 4. HERO SECTION */}
                <div className="absolute left-12 bottom-36 right-12 z-20">
                    <div className="flex justify-between items-end">
                        <div className="space-y-12 max-w-2xl">
                            {/* Game Logo (icon_url) */}
                            <div className="h-44 md:h-64 relative w-full transform -translate-x-4">
                                {game.iconUrl ? (
                                    <Image src={game.iconUrl} alt={game.title} fill className="object-contain object-left drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]" unoptimized />
                                ) : (
                                    <h1 className="text-8xl md:text-9xl font-black italic uppercase tracking-tighter drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)] leading-none">{game.title}</h1>
                                )}
                            </div>

                            {/* Main Buttons */}
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={handleActionClick}
                                    className="px-16 py-5 bg-white text-black font-black text-2xl rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4"
                                >
                                    {isUnlocked ? 'Download Now' : 'Play Game'}
                                </button>
                                <button 
                                    className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-2xl flex items-center justify-center hover:bg-white/25 transition-all border border-white/10 shadow-2xl"
                                >
                                    <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Hours Played (view_count) */}
                        <div className="bg-black/50 backdrop-blur-2xl px-10 py-4 rounded-[1.8rem] border border-white/10 flex items-center gap-5 shadow-2xl mb-4">
                            <svg className="w-9 h-9 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                            <span className="text-3xl font-black tracking-tighter">{hoursPlayed}h</span>
                        </div>
                    </div>
                </div>

                {/* 5. BOTTOM CARDS */}
                <div className="absolute left-12 bottom-10 z-20 flex gap-8 w-full">
                    {/* Trophies (rating) */}
                    <div className="w-[520px] bg-white/10 backdrop-blur-3xl rounded-[2.8rem] p-8 border border-white/10 flex items-center gap-8 hover:bg-white/15 transition-all shadow-2xl">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6v7a6 6 0 0 0 12 0V2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex gap-2.5 mb-2.5">
                                {[1,1,1,1].map((_,i) => <div key={i} className="w-6 h-6 rounded-sm bg-blue-400/80" />)}
                                <span className="text-xl font-bold opacity-40 ml-2">12</span>
                            </div>
                            <h4 className="text-2xl font-black uppercase tracking-tight mb-0.5">Trophies</h4>
                            <p className="text-white/40 text-sm font-black uppercase tracking-widest">{game.rating || 98}% Approval Rating</p>
                        </div>
                    </div>

                    {/* Friends (downloadsCount) */}
                    <div className="w-[520px] bg-white/10 backdrop-blur-3xl rounded-[2.8rem] p-8 border border-white/10 flex items-center gap-8 hover:bg-white/15 transition-all shadow-2xl">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex -space-x-3.5 mb-2.5">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-9 h-9 rounded-full border-[3px] border-[#111] bg-gray-700 overflow-hidden relative shadow-lg"><Image src={`https://i.pravatar.cc/60?u=${i+40}`} alt="" fill /></div>)}
                            </div>
                            <h4 className="text-2xl font-black uppercase tracking-tight mb-0.5">Friends Who Play</h4>
                            <p className="text-white/40 text-sm font-black uppercase tracking-widest">{(game.downloadsCount || 1500).toLocaleString()} Players Tracked</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                body { background-color: black; overflow: hidden; }
                header:not(.relative) { display: none !important; }
                nav.fixed { display: none !important; }
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
    const similar = await getRelatedGames(game.id, game.category, 12);
    return { props: { game, similarGames: similar }, revalidate: 60 };
};

export default GameDetailPage;