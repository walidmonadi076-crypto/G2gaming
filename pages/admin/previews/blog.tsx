import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { BlogPost, Comment } from '../../../types';
import Ad from '../../../components/Ad';
import SEO from '../../../components/SEO';
import StarRating from '../../../components/StarRating';
import CommentCard from '../../../components/CommentCard';
import ShareBar from '../../../components/ShareBar';
import HtmlContent from '../../../components/HtmlContent';

const BlogPreviewPage: React.FC = () => {
    const [post, setPost] = useState<Partial<BlogPost>>({
        title: 'Draft Insight',
        summary: 'Preview summary...',
        imageUrl: 'https://picsum.photos/seed/blog-placeholder/800/450',
        author: 'Admin',
        publishDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        rating: 4.5,
        content: '<p>Content will sync here in real-time as you type.</p>',
        category: 'Guide'
    });

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'preview-update') {
                setPost(prev => ({ ...prev, ...event.data.payload }));
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const mockComment: Comment = {
        id: 1,
        author: "Preview User",
        avatarUrl: "https://i.pravatar.cc/40?u=preview",
        date: "Just now",
        text: "This is a placeholder to show how the community section will look.",
        status: 'approved',
        email: 'test@example.com'
    };

    return (
        <>
            <SEO title={`Preview: ${post.title}`} noindex={true} />
            <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-purple-500 pb-20 relative overflow-x-hidden">
                <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none z-0" />
                <div className="relative z-10 max-w-[1600px] mx-auto px-4 pt-8">
                    <div className="mb-8 opacity-50">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 cursor-not-allowed inline-flex items-center gap-2">
                             &lt; Back to Journal (Disabled)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                        <aside className="hidden lg:block lg:col-span-2">
                            <div className="sticky top-24"><Ad placement="blog_skyscraper_left" /></div>
                        </aside>
                        
                        <main className="col-span-12 lg:col-span-8 max-w-4xl mx-auto w-full">
                            <header className="mb-10 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">{post.category}</div>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-none">{post.title}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-400 font-medium border-y border-white/5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">{post.author?.charAt(0) || 'A'}</div>
                                        <span className="text-white">{post.author}</span>
                                    </div>
                                    <span className="hidden md:inline text-gray-700">|</span>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span>{post.publishDate}</span>
                                    </div>
                                    <span className="hidden md:inline text-gray-700">|</span>
                                    <StarRating rating={post.rating || 0} />
                                </div>
                            </header>

                            <div className="group relative w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/10">
                                {post.videoUrl ? 
                                    <video key={post.videoUrl} src={post.videoUrl} controls autoPlay muted className="w-full h-full object-cover" /> : 
                                    <Image key={post.imageUrl} src={post.imageUrl || 'https://picsum.photos/seed/blog-placeholder/800/450'} alt="" fill className="object-cover" unoptimized />
                                }
                            </div>
                            
                            <HtmlContent html={post.content || ''} className="mb-12" />

                            <div className="mt-16 pt-10 border-t border-white/5">
                                <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3"><span className="w-1 h-8 bg-blue-500 rounded-full"></span>Community <span className="text-gray-600 text-xl font-bold">(1)</span></h2>
                                <div className="space-y-6 mb-12">
                                    <div className="bg-gray-900/50 rounded-2xl p-1 border border-white/5"><CommentCard comment={mockComment} /></div>
                                </div>
                            </div>
                        </main>

                        <aside className="hidden lg:block lg:col-span-2">
                            <div className="sticky top-24 space-y-8"><Ad placement="blog_skyscraper_right" /></div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogPreviewPage;