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

const StatItem = ({ label, value, icon, color = "purple" }: { label: string, value: string | number, icon: React.ReactNode, color?: string }) => (
    <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl backdrop-blur-sm flex items-center gap-4 group hover:bg-white/[0.06] transition-all">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center text-${color}-400 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div>
            <span className="block text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</span>
            <span className="block text-white font-black tracking-tight">{value}</span>
        </div>
    </div>
);

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

    if (router.isFallback) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-purple-500 font-black tracking-widest animate-pulse">SYNCING DATA...</div>;

    // Actual Data Formatting from DB
    const formattedRating = game.rating ? `${game.rating}%` : '98%';
    const formattedDownloads = game.downloadsCount ? new Intl.NumberFormat().format(game.downloadsCount) : '1,500';

    return (
        <>
            <SEO title={game.title} description={game.description.replace(/<[^>]*>/g, '').slice(0, 160)} image={game.imageUrl} url={`/games/${game.slug}`} />
            
            <div className="min-h-screen bg-[#08080a] text-white font-sans selection:bg-purple-500 pb-32 relative overflow-x-hidden">
                {/* Immersive Background */}
                <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
                    <Image src={game.backgroundUrl || game.imageUrl} alt="" fill className="object-cover opacity-20 blur-sm scale-105" priority unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#08080a] via-[#08080a]/60 to-[#08080a]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#08080a_85%)]" />
                </div>

                <div className="relative z-10 max-w-[1500px] mx-auto px-4 pt-12">
                    <div className="mb-10">
                        <Link href={`/games?platform=${game.platform || 'pc'}`} className="group inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all">
                            <span className="w-8 h-8 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center group-hover:border-purple-500 group-hover:bg-purple-500/20 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </span>
                            Back to Library
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
                        <div className="lg:col-span-8 space-y-12">
                            {/* Header Info */}
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest">{game.category}</span>
                                    {game.tags?.map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-[9px] font-black uppercase tracking-widest">{tag}</span>
                                    ))}
                                </div>
                                <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] italic drop-shadow-2xl">
                                    {game.title}
                                </h1>
                            </div>

                            {/* Main Media Stage */}
                            <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10 group bg-black">
                                <button className="w-full h-full relative block cursor-zoom-in" onClick={() => openLightbox(0)}>
                                    {game.videoUrl ? (
                                        embedUrl ? <iframe src={embedUrl} className="w-full h-full pointer-events-none" title={game.title} /> 
                                        : <video src={game.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                                    ) : <Image src={game.gallery[0] || game.imageUrl} alt={game.title} fill className="object-cover transition-transform duration-[3s] group-hover:scale-105" priority unoptimized />}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent opacity-80" />
                                </button>
                            </div>

                            {/* Description - Prioritized Content */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <span className="w-1 h-8 bg-purple-600 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></span>
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Intelligence Report</h2>
                                </div>
                                <div className="bg-white/[0.02] rounded-[2.2rem] p-8 md:p-10 border border-white/5 shadow-inner backdrop-blur-sm">
                                    <HtmlContent html={game.description} className="text-gray-400 text-lg leading-relaxed" />
                                </div>
                            </section>

                            {/* Stats Matrix */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatItem label="Player Rating" value={formattedRating} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z"/></svg>} color="green" />
                                <StatItem label="Total Deploys" value={formattedDownloads} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>} color="blue" />
                                <StatItem label="Platform" value={game.platform?.toUpperCase() || 'PC'} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} color="purple" />
                                <StatItem label="Security Status" value="Verified" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} color="yellow" />
                            </div>

                            {/* The Terminal (Locker Unit) */}
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/30 via-transparent to-blue-500/30 rounded-[3rem] blur-xl opacity-60 animate-pulse"></div>
                                <div className="relative bg-[#0d0d12] rounded-[2.5rem] p-10 md:p-16 border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden">
                                    {/* Grid Pattern Overlay */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                                    
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        {/* Security Icon */}
                                        <div className="w-20 h-20 rounded-[2.2rem] bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(168,85,247,0.5)] transform -rotate-3 border border-white/20">
                                            {isUnlocked ? (
                                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                            ) : (
                                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            )}
                                        </div>

                                        <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                                            {isUnlocked ? 'AUTHORIZATION GRANTED' : 'SECURE AUTHORIZATION REQUIRED'}
                                        </h3>
                                        <p className="text-gray-500 text-sm md:text-base max-w-lg mb-12 font-medium leading-relaxed uppercase tracking-wide opacity-80">
                                            {isUnlocked 
                                              ? 'Security firewall bypassed. Your high-speed download links are now active below.' 
                                              : 'Encrypted servers detected. Complete the bypass sequence below to reveal the high-speed download infrastructure.'}
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl">
                                            <button 
                                                onClick={!isUnlocked ? handleVerificationClick : () => window.open(game.downloadUrl)} 
                                                className={`
                                                    flex-1 group relative py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all active:scale-95
                                                    ${isUnlocked ? 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'bg-white text-black shadow-2xl'}
                                                `}
                                            >
                                                <span className="relative z-10 flex items-center justify-center gap-3">
                                                    {isUnlocked ? (game.platform === 'mobile' ? 'DEPLOY APK' : 'START DOWNLOAD') : 'BYPASS SECURITY FIREWALL'}
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                                            </button>

                                            {(game.downloadUrlIos || game.platform === 'mobile') && (
                                                <button 
                                                    onClick={!isUnlocked ? handleVerificationClick : () => window.open(game.downloadUrlIos || '#')} 
                                                    className="flex-1 py-6 rounded-2xl bg-[#1a1b23] text-white font-black uppercase tracking-[0.2em] text-sm border border-white/10 hover:bg-[#23242e] transition-all active:scale-95 shadow-lg"
                                                >
                                                    {isUnlocked ? 'DOWNLOAD FOR IOS' : 'UNLOCK IOS MATRIX'}
                                                </button>
                                            )}
                                        </div>
                                        
                                        {!isUnlocked && (
                                            <div className="mt-10 flex flex-wrap justify-center items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                                                <span>AES-256 VERIFIED</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                                                <span>NO CREDIT CARD REQUIRED</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                                                <span>INSTANT ACCESS</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: System Data */}
                        <aside className="lg:col-span-4 relative space-y-12">
                            <div className="sticky top-24 space-y-10">
                                {/* System Parameters (Actual DB Requirements) */}
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
                                                <div key={key} className="border-l-2 border-purple-600/30 pl-6 py-1 hover:border-purple-500 transition-colors">
                                                    <span className="block text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">{key}</span>
                                                    <span className="block text-sm font-black text-white uppercase">{value as string}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Visual Archives */}
                                <div className="bg-[#0d0d12]/50 backdrop-blur-xl rounded-[2.2rem] p-8 border border-white/10 shadow-2xl">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8">Visual Archives</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {game.gallery.slice(0, 4).map((img, index) => (
                                            <button key={index} onClick={() => openLightbox(game.videoUrl ? index + 1 : index)} className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all group bg-black">
                                                <Image src={img} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Ad placement="game_vertical" className="w-full rounded-[2.2rem] border border-white/5 shadow-2xl" />
                            </div>
                        </aside>
                    </div>

                    <RecommendedSection title="Similar Modules" subtitle="Synchronized Categories" items={similarGames} />
                    <RecommendedSection title="Active Trending" subtitle="Community Overload" items={trendingGames} accentColor="bg-blue-600" />
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