
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getGameBySlug, getAllGames } from '../../lib/data';
import type { Game } from '../../types';
import Ad from '../../components/Ad';
import SEO from '../../components/SEO';
import Lightbox from '../../components/Lightbox';

declare global {
    interface Window { 
        og_load: () => void;
        onLockerUnlock?: () => void;
    }
}

interface GameDetailPageProps { game: Game; }

const GameDetailPage: React.FC<GameDetailPageProps> = ({ game }) => {
    const router = useRouter();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isOgadsReady, setIsOgadsReady] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const mediaItems = useMemo(() => {
        const items = [];
        if (game.videoUrl) {
            items.push({ type: 'video' as const, src: game.videoUrl });
        }
        game.gallery.forEach(img => {
            items.push({ type: 'image' as const, src: img });
        });
        if (items.length === 0 && game.imageUrl) {
            items.push({ type: 'image' as const, src: game.imageUrl });
        }
        return items;
    }, [game]);
    
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    useEffect(() => {
        // Track view on page load
        if (router.isReady && game.slug && process.env.NODE_ENV === 'production') {
            const trackView = async () => {
                try {
                    await fetch('/api/views/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'games', slug: game.slug }),
                    });
                } catch (error) {
                    console.error('Failed to track view:', error);
                }
            };
            trackView();
        }
    }, [router.isReady, game.slug]);

    useEffect(() => {
        const handleUnlock = () => {
            console.log("OGAds locker unlocked! Enabling download button.");
            setIsUnlocked(true);
        };
        window.onLockerUnlock = handleUnlock;
        return () => {
            delete window.onLockerUnlock;
        };
    }, []);

    useEffect(() => {
        if (typeof window.og_load === 'function') {
            setIsOgadsReady(true);
            return;
        }
        
        const intervalId = setInterval(() => {
            if (typeof window.og_load === 'function') {
                setIsOgadsReady(true);
                clearInterval(intervalId);
            }
        }, 200);

        return () => clearInterval(intervalId);
    }, []);


    if (router.isFallback) {
        return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">Loading Game Data...</div>;
    }

    const gameSchema = {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": game.title,
        "description": game.description,
        "image": game.imageUrl,
        "applicationCategory": "Game",
        "operatingSystem": "Windows, macOS, Linux",
        "genre": game.category,
        "keywords": game.tags?.join(', ') || ''
    };
    
    const handleVerificationClick = () => {
        if (isOgadsReady && typeof window.og_load === 'function') {
            window.og_load();
        } else {
            console.error("OGAds script (og_load) is not available.");
            alert("The verification service is currently unavailable. Please try again later.");
        }
    };

    return (
        <>
            <SEO
                title={game.title}
                description={game.description}
                image={game.imageUrl}
                url={`/games/${game.slug}`}
                schema={gameSchema}
            />
            
            <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-purple-500 selection:text-white pb-20">
                {/* Background Ambient Glow */}
                <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    {/* Breadcrumb / Back Link */}
                    <div className="mb-8">
                        <Link 
                            href="/games" 
                            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                        >
                            <span className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-purple-500 group-hover:bg-purple-500/20 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </span>
                            Back to Library
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* --- LEFT COLUMN (Main Content) --- */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            
                            {/* 1. Hero Media Card */}
                            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 group">
                                <button 
                                    className="w-full h-full relative block cursor-zoom-in"
                                    onClick={() => openLightbox(0)}
                                >
                                    {game.videoUrl ? (
                                        <video 
                                            src={game.videoUrl} 
                                            autoPlay 
                                            muted 
                                            loop 
                                            playsInline
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <Image 
                                            src={game.gallery[0] || game.imageUrl} 
                                            alt={game.title} 
                                            fill 
                                            sizes="(max-width: 1024px) 100vw, 800px" 
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            priority
                                        />
                                    )}
                                    
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent opacity-80" />
                                    
                                    {/* Play Icon Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* 2. Header Info & Actions */}
                            <div className="flex flex-col gap-6">
                                {/* Tags Row */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-700">
                                        {game.category}
                                    </span>
                                    {game.tags?.map(tag => (
                                        <span 
                                            key={tag} 
                                            className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                                                tag === 'Play on Comet' ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' :
                                                tag === 'New' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                                                'bg-gray-800 text-gray-300 border-gray-700'
                                            }`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Title */}
                                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                                    {game.title}
                                </h1>

                                {/* Description */}
                                <p className="text-lg text-gray-400 leading-relaxed max-w-3xl">
                                    {game.description}
                                </p>

                                {/* Action Area (Download/Verify) */}
                                <div className="mt-4 p-6 rounded-2xl bg-gray-900/50 border border-white/5 backdrop-blur-sm relative overflow-hidden">
                                    {/* Glow Effect behind button */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-20 bg-purple-600/20 blur-[60px] rounded-full pointer-events-none" />
                                    
                                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-1">Get this Game</h3>
                                            <p className="text-sm text-gray-400">
                                                {isUnlocked 
                                                    ? "Verification complete. Download is ready." 
                                                    : "Complete a quick verification to unlock the download link."}
                                            </p>
                                        </div>

                                        {!isUnlocked ? (
                                            <button 
                                                onClick={handleVerificationClick}
                                                disabled={!isOgadsReady}
                                                className="group relative w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed overflow-hidden"
                                            >
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    {isOgadsReady ? (
                                                        <>
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                            Verify & Unlock
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                            Initializing...
                                                        </>
                                                    )}
                                                </span>
                                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                                            </button>
                                        ) : (
                                            <a 
                                                href={game.downloadUrl} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 animate-fade-in"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                Download Now
                                            </a>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Mobile/Tablet Ad - Horizontal (Visible mostly on smaller screens where sidebar drops) */}
                                <div className="block lg:hidden mt-4 w-full">
                                    <div className="bg-gray-900/50 rounded-xl border border-white/5 p-4 flex justify-center items-center">
                                        <Ad placement="game_horizontal" />
                                    </div>
                                </div>

                                {/* About Section */}
                                <div className="mt-4 border-t border-white/5 pt-8">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                        About This Game
                                    </h2>
                                    <div className="prose prose-invert prose-lg text-gray-400 max-w-none">
                                        <p>
                                            Experience the thrill of <strong>{game.title}</strong>. 
                                            {game.description} Dive into immersive gameplay, stunning visuals, and challenging mechanics that will keep you on the edge of your seat.
                                        </p>
                                        <p>
                                            Whether you are a casual player or a hardcore gamer, this title offers something unique. 
                                            Master the controls, climb the leaderboards, and discover all the secrets hidden within.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN (Sticky Sidebar) --- */}
                        <div className="lg:col-span-4 relative">
                            <div className="sticky top-24 flex flex-col gap-8">
                                
                                {/* Screenshots Widget */}
                                <div className="bg-gray-900 rounded-2xl p-6 border border-white/5 shadow-xl">
                                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                        Screenshots
                                        <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">{game.gallery.length + (game.videoUrl ? 1 : 0)}</span>
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        {game.gallery.slice(0, 4).map((img, index) => (
                                            <button 
                                                key={index} 
                                                onClick={() => openLightbox(game.videoUrl ? index + 1 : index)}
                                                className="relative aspect-video rounded-lg overflow-hidden border border-gray-800 group hover:border-purple-500 transition-colors"
                                            >
                                                <Image 
                                                    src={img} 
                                                    alt={`${game.title} screenshot ${index + 1}`} 
                                                    fill 
                                                    sizes="200px" 
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                                />
                                                <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/20 transition-colors" />
                                            </button>
                                        ))}
                                        {game.gallery.length > 4 && (
                                            <button 
                                                onClick={() => openLightbox(4)}
                                                className="col-span-2 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-white transition-colors bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-600"
                                            >
                                                + {game.gallery.length - 4} More Images
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Vertical Ad Area (Sticky) */}
                                <div className="bg-gray-900 rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col items-center text-center">
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Sponsored Content</span>
                                    <div className="w-full flex justify-center min-h-[600px] bg-black/20 rounded-xl overflow-hidden">
                                        <Ad placement="game_vertical" />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {lightboxOpen && (
                <Lightbox
                    items={mediaItems}
                    startIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const games = await getAllGames();
    const paths = games
        .filter(game => game && game.slug && typeof game.slug === 'string')
        .map(game => ({
            params: { slug: game.slug },
        }));
    return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const slug = context.params?.slug as string;
    if (!slug) return { notFound: true };

    const game = await getGameBySlug(slug);
    if (!game) return { notFound: true };

    return {
        props: { game },
        revalidate: 60,
    };
};

export default GameDetailPage;
