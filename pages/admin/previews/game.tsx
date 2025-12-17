
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '../../../types';
import Ad from '../../../components/Ad';
import SEO from '../../../components/SEO';
import Lightbox from '../../../components/Lightbox';

const GamePreviewPage: React.FC = () => {
    const [game, setGame] = useState<Partial<Game>>({
        title: 'Game Preview',
        imageUrl: 'https://picsum.photos/seed/placeholder/800/600',
        description: 'Description will appear here once you start typing.',
        tags: [],
        gallery: [],
        downloadUrl: '#',
    });

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'preview-update') {
                setGame(prev => ({ ...prev, ...event.data.payload }));
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const mediaItems = useMemo(() => {
        const items = [];
        if (game.videoUrl) items.push({ type: 'video' as const, src: game.videoUrl });
        (game.gallery || []).forEach(img => items.push({ type: 'image' as const, src: img }));
        if (items.length === 0 && game.imageUrl) items.push({ type: 'image' as const, src: game.imageUrl });
        return items;
    }, [game]);
    
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const displayImageUrl = game.gallery?.[0] || game.imageUrl || 'https://picsum.photos/seed/placeholder/800/600';

    return (
        <>
            <SEO title={`Preview: ${game.title}`} noindex={true} />
            <div className="max-w-7xl mx-auto">
                <div className="mb-4">
                    <span className="text-sm text-purple-400 cursor-not-allowed">&lt; Back to Games</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                            <button className="aspect-video bg-black relative w-full group" onClick={() => openLightbox(0)}>
                                {game.videoUrl ? (
                                    <video key={game.videoUrl} src={game.videoUrl} autoPlay muted loop className="w-full h-full object-contain" />
                                ) : (
                                    <Image key={displayImageUrl} src={displayImageUrl} alt={game.title || 'Game Preview'} fill sizes="100vw" className="object-cover" />
                                )}
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                                </div>
                            </button>
                            <div className="p-6">
                                <h1 className="text-4xl font-extrabold text-white mb-3">{game.title || 'Game Title'}</h1>
                                <div className="flex flex-wrap gap-2 mb-6">{(game.tags || []).map(tag => <span key={tag} className="text-xs font-semibold bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full">{tag}</span>)}</div>
                                
                                {/* FIX: Render HTML correctly in preview */}
                                <div className="text-gray-300 leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: game.description || 'Game description...' }} />
                                
                                <div className="mt-8">
                                    <button 
                                        disabled
                                        className="inline-block w-full sm:w-auto text-center bg-gray-500 text-white font-bold py-3 px-8 rounded-lg text-lg cursor-not-allowed"
                                    >
                                        Download (Preview Disabled)
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                          <Ad placement="game_horizontal" />
                        </div>
                    </div>
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">Screenshots</h3>
                        <div className="grid grid-cols-2 gap-4">{(game.gallery || []).map((img, index) => (
                             <button key={index} className="relative rounded-lg object-cover aspect-video overflow-hidden group" onClick={() => openLightbox(game.videoUrl ? index + 1 : index)}>
                                <Image src={img} alt={`${game.title} screenshot ${index + 1}`} fill sizes="50vw" className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        ))}</div>
                        <Ad placement="game_vertical" />
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

export default GamePreviewPage;
