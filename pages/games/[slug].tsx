
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
import GameCarousel from '../../components/GameCarousel';
import { getEmbedUrl } from '../../lib/utils';
import HtmlContent from '../../components/HtmlContent';

declare global {
    interface Window { 
        og_load?: () => void;
        onLockerUnlock?: () => void;
    }
}

interface GameDetailPageProps { 
    game: Game; 
    similarGames: Game[]; 
    trendingGames: Game[]; 
}

const StatBadge = ({ icon, label, value, color = "purple" }: { icon: React.ReactNode, label: string, value: string | number, color?: string }) => {
    const colorMap: Record<string, string> = {
        purple: "text-purple-400 border-purple-500/20 bg-purple-500/5",
        blue: "text-blue-400 border-blue-500/20 bg-blue-500/5",
        green: "text-green-400 border-green-500/20 bg-green-500/5",
        yellow: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5"
    };

    return (
        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${colorMap[color]} backdrop-blur-sm group hover:scale-105 transition-transform duration-300`}>
            <div className="w-10 h-10 rounded-xl bg-gray-900/50 flex items-center justify-center border border-white/5 group-hover:rotate-12 transition-transform">
                {icon}
            </div>
            <div>
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{label}</span>
                <span className="block text-lg font-black tracking-tight text-white">{value}</span>
            </div>
        </div>
    );
};

const RecommendedSection = ({ title, subtitle, items, accentColor = "bg-purple-600" }: { title: string, subtitle: string, items: Game[], accentColor?: string }) => {
    if (!items || items.length === 0) return null;
    return (
        <section className="mt-24 border-t border-white/5 pt-16">
            <div className="flex flex-col mb-10">
                <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 ${accentColor} rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)]`}></div>
                    <div>
                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">{title}</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] ml-1">{subtitle}</p>
                    </div>
                </div>
            </div>
            <GameCarousel games={items} xmbEffect={true} />
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

    useEffect(() => {
        if (game.slug) {
            const unlocked = sessionStorage.getItem(`unlocked_${game.slug}`);
            if (unlocked === 'true') setIsUnlocked(true);
        }
    }, [game.slug]);

    useEffect(() => {
        const handleUnlock = () => {
            if (game.slug) {
                sessionStorage.setItem(`unlocked_${game.slug}`, 'true');
                window.location.reload(); 
            }
        };
        window.addEventListener("ogads_unlocked", handleUnlock);
        window.onLockerUnlock = handleUnlock;

        const int = setInterval(() => { 
            if (typeof window.og_load === 'function') { 
                setIsOgadsReady(true); 
                clearInterval(int); 
            } 
        }, 200);

        return () => { 
            window.removeEventListener("ogads_unlocked", handleUnlock);
            delete window.onLockerUnlock;
            clearInterval(int);
        };
    }, [game.slug]);

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

    const handleVerificationClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isOgadsReady && typeof window.og_load === 'function') {
            window.og_load();
        } else {
            alert("Terminal connection initializing... Please wait.");
        }
    };

    if (router.isFallback) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-purple-500 font-black tracking-widest animate-pulse">LOADING CORE...</div>;

    const rating = game.rating || 95;
    const downloads = game.downloadsCount || 10000;

    return (
        <>
            <SEO title={game.title} description={game.description.replace(/<[^>]*>/g, '').slice(0, 160)} image={game.imageUrl} url={`/games/${game.slug}`} />
            
            <div className="min-h-screen bg-[#08080a] text-white font-sans selection:bg-purple-500 pb-32 relative overflow-x-hidden">
                {/* Immersive Background */}
                <div className="fixed top-0 left-0 w-full h-full z-0">
                    <Image src={game.backgroundUrl || game.imageUrl} alt="" fill className="object-cover opacity-20 blur-sm scale-105" priority unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#08080a] via-transparent to-[#08080a]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#08080a_80%)]" />
                </div>

                <div className="relative z-10 max-w-[1500px] mx-auto px-4 pt-12">
                    <div className="mb-12">
                        <Link href={`/games?platform=${game.platform || 'pc'}`} className="group inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all">
                            <span className="w-8 h-8 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center group-hover:border-purple-500 group-hover:bg-purple-500/20 group-hover:-translate-x-1 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </span>
                            Return to Database
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
                        {/* Main UI */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* Cinematic Stage */}
                            <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10 group bg-black">
                                <button className="w-full h-full relative block cursor-zoom-in overflow-hidden" onClick={() => openLightbox(0)}>
                                    {game.videoUrl ? (
                                        embedUrl ? <iframe src={embedUrl} className="w-full h-full pointer-events-none" title={game.title} /> 
                                        : <video src={game.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                                    ) : <Image src={game.gallery[0] || game.imageUrl} alt={game.title} fill className="object-cover transition-transform duration-[3s] group-hover:scale-110" priority unoptimized />}
                                    
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent opacity-80" />
                                    
                                    {/* Floating Badges */}
                                    <div className="absolute top-6 left-6 flex gap-2">
                                        <div className="px-4 py-2 rounded-xl bg-purple-600/90 backdrop-blur-md border border-purple-400/50 text-[10px] font-black uppercase tracking-widest shadow-2xl">
                                            {game.platform} CORE
                                        </div>
                                        {game.tags?.includes('Hot') && (
                                            <div className="px-4 py-2 rounded-xl bg-red-600/90 backdrop-blur-md border border-red-400/50 text-[10px] font-black uppercase tracking-widest animate-pulse shadow-2xl">
                                                Trending
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>

                            {/* Info & Access Terminal */}
                            <div className="space-y-10">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="max-w-2xl">
                                        <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] italic mb-4 drop-shadow-2xl">
                                            {game.title}
                                        </h1>
                                        <div className="flex flex-wrap gap-2">
                                            {game.tags?.map(tag => (
                                                <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-[9px] font-black uppercase tracking-widest">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <div className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-1">Stability Status</div>
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-black uppercase tracking-widest">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                                            99.9% Operational
                                        </div>
                                    </div>
                                </div>

                                {/* Access Terminal (The "Wa3r" Part) */}
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
                                    <div className="relative bg-[#0d0d12] rounded-[2.2rem] p-8 md:p-12 border border-white/10 shadow-2xl overflow-hidden">
                                        {/* Grid background */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                        
                                        <div className="relative z-10 flex flex-col items-center text-center">
                                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(168,85,247,0.4)] transform -rotate-6">
                                                {isUnlocked ? (
                                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                ) : (
                                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                )}
                                            </div>

                                            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                                                {isUnlocked ? 'Terminal Authorization Granted' : 'Secure Authorization Required'}
                                            </h3>
                                            <p className="text-gray-500 text-sm max-w-md mb-10 font-medium leading-relaxed">
                                                {isUnlocked 
                                                  ? 'High-speed encryption completed. Servers are ready for direct data transfer to your device.' 
                                                  : 'Encrypted servers detected. Complete the bypass sequence below to reveal the high-speed download infrastructure.'}
                                            </p>

                                            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
                                                <button 
                                                    onClick={!isUnlocked ? handleVerificationClick : () => window.open(game.downloadUrl)} 
                                                    className={`
                                                        flex-1 group relative py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all active:scale-95
                                                        ${isUnlocked ? 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'bg-white text-black shadow-2xl'}
                                                    `}
                                                >
                                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                                        {isUnlocked ? (game.platform === 'mobile' ? 'Deploy APK' : 'Initialize Download') : 'Bypass Security Firewall'}
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                                    </span>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                                                </button>

                                                {game.platform === 'mobile' && (
                                                    <button 
                                                        onClick={!isUnlocked ? handleVerificationClick : () => window.open(game.downloadUrlIos)} 
                                                        className="flex-1 py-5 rounded-2xl bg-gray-800 text-white font-black uppercase tracking-[0.2em] text-sm border border-white/5 hover:bg-gray-700 transition-all active:scale-95"
                                                    >
                                                        {isUnlocked ? 'Download iOS' : 'Unlock iOS Matrix'}
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {!isUnlocked && (
                                                <div className="mt-8 flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                                    <span>AES-256 Verified</span>
                                                    <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                                                    <span>No Credit Card Required</span>
                                                    <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                                                    <span>Instant Access</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatBadge label="Global Rating" value={`${rating}%`} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z"/></svg>} color="green" />
                                    <StatBadge label="Total Downloads" value={new Intl.NumberFormat().format(downloads)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>} color="blue" />
                                    <StatBadge label="Security Scan" value="Clean" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} color="purple" />
                                    <StatBadge label="Game Version" value="v1.04" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="yellow" />
                                </div>

                                {/* Description */}
                                <section className="pt-8">
                                    <h2 className="text-3xl font-black text-white uppercase italic mb-8 flex items-center gap-4">
                                        <span className="w-1 h-8 bg-purple-600 rounded-full"></span>
                                        Intelligence Report
                                    </h2>
                                    <div className="bg-white/[0.02] rounded-[2rem] p-8 md:p-10 border border-white/5 shadow-inner">
                                        <HtmlContent html={game.description} className="text-gray-400 text-lg leading-relaxed" />
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-12">
                            <div className="sticky top-24 space-y-10">
                                {/* System Requirements */}
                                {game.requirements && (
                                    <div className="bg-[#0d0d12] rounded-[2.2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                                        </div>
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                            <span className="w-4 h-0.5 bg-gray-800"></span> System Parameters
                                        </h3>
                                        <div className="space-y-6">
                                            {Object.entries(game.requirements).map(([key, value]) => (
                                                <div key={key} className="border-l-2 border-purple-600/30 pl-6 py-1 group-hover:border-purple-600 transition-colors">
                                                    <span className="block text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">{key}</span>
                                                    <span className="block text-sm font-black text-white uppercase">{value as string}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Media Cluster */}
                                <div className="bg-[#0d0d12]/50 backdrop-blur-xl rounded-[2.2rem] p-8 border border-white/10 shadow-2xl">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8">Visual Archives</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {game.gallery.slice(0, 4).map((img, index) => (
                                            <button key={index} onClick={() => openLightbox(game.videoUrl ? index + 1 : index)} className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all group bg-black shadow-lg hover:shadow-purple-500/10">
                                                <Image src={img} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sidebar Ads */}
                                <div className="flex justify-center">
                                    <Ad placement="game_vertical" className="w-full rounded-[2.2rem] overflow-hidden border border-white/5 shadow-2xl" />
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* Bottom Carousels */}
                    <div className="space-y-12">
                        <RecommendedSection title="Similar Modules" subtitle="Synchronized Categories" items={similarGames} />
                        <RecommendedSection title="Active Trending" subtitle="Community Overload" items={trendingGames} accentColor="bg-blue-600" />
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
    const similar = await getRelatedGames(game.id, game.category);
    const trending = await getTrendingGames(game.id);
    return { props: { game, similarGames: similar, trendingGames: trending }, revalidate: 60 };
};

export default GameDetailPage;
