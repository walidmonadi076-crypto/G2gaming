
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getBlogPostBySlug, getAllBlogPosts, getCommentsByBlogId } from '../../lib/data';
import type { BlogPost, Comment } from '../../types';
import Ad from '../../components/Ad';
import SEO from '../../components/SEO';
import StarRating from '../../components/StarRating';
import CommentCard from '../../components/CommentCard';
import CommentForm from '../../components/CommentForm';
import ShareBar from '../../components/ShareBar';

interface BlogDetailPageProps { post: BlogPost; comments: Comment[]; }

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ post, comments: initialComments }) => {
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>(initialComments);

    useEffect(() => {
        if (router.isReady && post.slug && process.env.NODE_ENV === 'production') {
            // Fire-and-forget request to track view
            const trackView = async () => {
                try {
                    await fetch('/api/views/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'blogs', slug: post.slug }),
                    });
                } catch (error) {
                    console.error('Failed to track view:', error);
                }
            };
            trackView();
        }
    }, [router.isReady, post.slug]);

    if (router.isFallback) {
        return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">Loading Article...</div>;
    }

    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "author": {
            "@type": "Person",
            "name": post.author
        },
        "datePublished": new Date(post.publishDate).toISOString(),
        "image": post.imageUrl,
        "description": post.summary
    };

    const handleCommentAdded = (newComment: Comment) => {
        setComments(prevComments => [newComment, ...prevComments]);
    };

    return (
        <>
            <SEO
                title={post.title}
                description={post.summary}
                image={post.imageUrl}
                url={`/blog/${post.slug}`}
                schema={blogSchema}
            />

            {/* Smart Floating Share Bar (Desktop Only) - Placed outside main grid to handle fixed positioning */}
            <div className="hidden lg:block">
                <ShareBar title={post.title} orientation="vertical" initialCount={142} />
            </div>

            <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-purple-500 selection:text-white pb-20">
                {/* Ambient Background Glow */}
                <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link 
                            href="/blog" 
                            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                        >
                            <span className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-purple-500 group-hover:bg-purple-500/20 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </span>
                            Back to Journal
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                        
                        {/* --- LEFT SIDEBAR (Ad - Desktop ONLY) --- */}
                        <aside className="hidden lg:block lg:col-span-2">
                            <div className="sticky top-24 flex flex-col items-center w-full">
                                <Ad placement="blog_skyscraper_left" />
                            </div>
                        </aside>
                        
                        {/* --- MAIN CONTENT --- */}
                        <main className="col-span-12 lg:col-span-8 max-w-4xl mx-auto w-full">
                            
                            {/* Article Header */}
                            <header className="mb-10 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
                                    {post.category || 'Article'}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-[0.95] drop-shadow-xl">
                                    {post.title}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-400 font-medium border-y border-white/5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                            {post.author.charAt(0)}
                                        </div>
                                        <span className="text-white">{post.author}</span>
                                    </div>
                                    <span className="hidden md:inline text-gray-700">|</span>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span>{post.publishDate}</span>
                                    </div>
                                    <span className="hidden md:inline text-gray-700">|</span>
                                    <StarRating rating={post.rating} />
                                </div>
                            </header>

                            {/* Mobile/Tablet Ad - Visible ONLY on smaller screens */}
                            <div className="my-8 w-full flex justify-center lg:hidden">
                                <Ad placement="game_horizontal" className="shadow-lg" />
                            </div>

                            {/* Hero Media */}
                            <div className="group relative w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden mb-12 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5">
                                {post.videoUrl ? (
                                    <video 
                                        src={post.videoUrl} 
                                        controls 
                                        autoPlay 
                                        muted 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <Image 
                                        src={post.imageUrl} 
                                        alt={post.title} 
                                        fill 
                                        sizes="(max-width: 1024px) 100vw, 800px" 
                                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                        priority
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent opacity-60 pointer-events-none" />
                            </div>
                            
                            {/* Content Body */}
                            <article className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-purple-300 prose-strong:text-white prose-blockquote:border-purple-500 prose-blockquote:bg-gray-900/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-img:rounded-2xl prose-img:border prose-img:border-white/10 mb-12">
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            </article>

                            {/* CTA Block */}
                            {post.affiliateUrl && (
                                <div className="my-16 relative overflow-hidden rounded-3xl group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40 opacity-50 group-hover:opacity-70 transition-opacity" />
                                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm -z-10" />
                                    
                                    <div className="relative z-10 p-8 md:p-10 text-center border border-purple-500/20 rounded-3xl flex flex-col items-center">
                                        <h3 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-tight">
                                            Ready to Level Up?
                                        </h3>
                                        <p className="text-gray-400 mb-8 max-w-lg text-lg">
                                            Check out the product mentioned in this article and enhance your gaming setup today.
                                        </p>
                                        <a
                                            href={post.affiliateUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/btn relative inline-flex items-center justify-center px-8 py-4 font-black text-white uppercase tracking-widest text-sm bg-purple-600 rounded-xl overflow-hidden transition-transform active:scale-95 hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                View Product
                                                <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                        </a>
                                    </div>
                                </div>
                            )}
                            
                            {/* Mobile Share (Visible only on small screens) */}
                            <div className="my-12 lg:hidden p-6 bg-gray-900 rounded-2xl border border-white/5">
                                <h3 className="text-center text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Share this Article</h3>
                                <ShareBar title={post.title} orientation="horizontal" />
                            </div>

                            {/* Comments Section */}
                            <div className="mt-16 pt-10 border-t border-white/5">
                                <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
                                    <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
                                    Community <span className="text-gray-600 text-xl font-bold">({comments.length})</span>
                                </h2>
                                
                                {/* Comments List */}
                                <div className="space-y-6 mb-12">
                                    {comments.length > 0 ? (
                                        comments.map(comment => (
                                            <div key={comment.id} className="bg-gray-900/50 rounded-2xl p-1 border border-white/5">
                                                <CommentCard comment={comment} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
                                            <p className="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Comment Form */}
                                <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl">
                                    <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
                                </div>
                            </div>
                        </main>

                        {/* --- RIGHT SIDEBAR (Ad - Desktop ONLY) --- */}
                        <aside className="hidden lg:block lg:col-span-2">
                            <div className="sticky top-24 flex flex-col gap-8 items-center w-full">
                                {/* Ad Widget */}
                                <div className="w-full flex flex-col items-center">
                                    <Ad placement="blog_skyscraper_right" />
                                </div>
                            </div>
                        </aside>

                    </div>
                </div>
            </div>
        </>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getAllBlogPosts();
    const paths = posts
        .filter(post => post && post.slug && typeof post.slug === 'string')
        .map(post => ({
            params: { slug: post.slug },
        }));
    return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const slug = context.params?.slug as string;
    if (!slug) return { notFound: true };
    
    const post = await getBlogPostBySlug(slug);
    if (!post) return { notFound: true };
    
    const comments = await getCommentsByBlogId(post.id);
    return {
        props: { post, comments },
        revalidate: 60,
    };
};

export default BlogDetailPage;
