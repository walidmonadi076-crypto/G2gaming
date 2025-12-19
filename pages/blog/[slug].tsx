
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getBlogPostBySlug, getAllBlogPosts, getCommentsByBlogId, getRelatedBlogs, getPopularBlogs } from '../../lib/data';
import type { BlogPost, Comment } from '../../types';
import Ad from '../../components/Ad';
import SEO from '../../components/SEO';
import StarRating from '../../components/StarRating';
import CommentCard from '../../components/CommentCard';
import CommentForm from '../../components/CommentForm';
import ShareBar from '../../components/ShareBar';
import HtmlContent from '../../components/HtmlContent';
import BlogCard from '../../components/BlogCard';

interface BlogDetailPageProps { 
    post: BlogPost; 
    comments: Comment[]; 
    relatedBlogs: BlogPost[];
    popularBlogs: BlogPost[];
}

const RecommendedSection = ({ title, subtitle, items, accentColor = "bg-blue-500" }: { title: string, subtitle: string, items: BlogPost[], accentColor?: string }) => {
    if (!items || items.length === 0) return null;
    return (
        <section className="mt-20 border-t border-white/5 pt-12">
            <div className="flex flex-col mb-10">
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-8 ${accentColor} rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)]`}></div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{title}</h3>
                </div>
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] ml-5 mt-1">{subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map(item => (
                    <BlogCard key={item.id} post={item} />
                ))}
            </div>
        </section>
    );
};

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ post, comments: initialComments, relatedBlogs, popularBlogs }) => {
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>(initialComments);

    useEffect(() => {
        if (router.isReady && post.slug && process.env.NODE_ENV === 'production') {
            fetch('/api/views/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'blogs', slug: post.slug }),
            }).catch(console.error);
        }
    }, [router.isReady, post.slug]);

    if (router.isFallback) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">Loading...</div>;

    return (
        <>
            <SEO title={post.title} description={post.summary} image={post.imageUrl} url={`/blog/${post.slug}`} />
            <div className="hidden lg:block"><ShareBar title={post.title} orientation="vertical" initialCount={142} /></div>

            <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-purple-500 pb-20">
                <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none z-0" />
                <div className="relative z-10 max-w-[1600px] mx-auto px-4 pt-8">
                    <div className="mb-8">
                        <Link href="/blog" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                            <span className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-purple-500 group-hover:bg-purple-500/20 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </span>
                            Back to Journal
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                        <aside className="hidden lg:block lg:col-span-2"><div className="sticky top-24"><Ad placement="blog_skyscraper_left" /></div></aside>
                        
                        <main className="col-span-12 lg:col-span-8 max-w-4xl mx-auto w-full">
                            <header className="mb-10 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">{post.category}</div>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-none drop-shadow-xl">{post.title}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-400 font-medium border-y border-white/5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">{post.author.charAt(0)}</div>
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

                            <div className="group relative w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/10">
                                {post.videoUrl ? <video src={post.videoUrl} controls autoPlay muted className="w-full h-full object-cover" /> : <Image src={post.imageUrl} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority unoptimized />}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent opacity-60" />
                            </div>
                            
                            <HtmlContent html={post.content} className="mb-12" />

                            {post.affiliateUrl && (
                                <div className="my-16 relative overflow-hidden rounded-3xl group p-10 text-center border border-purple-500/20 bg-gray-900/50 backdrop-blur-md">
                                    <h3 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-tight">Ready to Level Up?</h3>
                                    <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">Check out the top gear mentioned in this article and enhance your performance.</p>
                                    <a href={post.affiliateUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-10 py-4 font-black text-white uppercase tracking-widest text-sm bg-purple-600 rounded-xl hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all transform active:scale-95">View Product</a>
                                </div>
                            )}

                            <RecommendedSection title="Related Articles" subtitle="More from this topic" items={relatedBlogs} />
                            <RecommendedSection title="Popular Reads" subtitle="Trending community content" items={popularBlogs} accentColor="bg-pink-500" />
                            
                            <div className="mt-16 pt-10 border-t border-white/5">
                                <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3"><span className="w-1 h-8 bg-blue-500 rounded-full"></span>Community <span className="text-gray-600 text-xl font-bold">({comments.length})</span></h2>
                                <div className="space-y-6 mb-12">
                                    {comments.map(c => <div key={c.id} className="bg-gray-900/50 rounded-2xl p-1 border border-white/5"><CommentCard comment={c} /></div>)}
                                </div>
                                <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl"><CommentForm postId={post.id} onCommentAdded={nc => setComments(p => [nc, ...p])} /></div>
                            </div>
                        </main>

                        <aside className="hidden lg:block lg:col-span-2 space-y-8"><div className="sticky top-24"><Ad placement="blog_skyscraper_right" /></div></aside>
                    </div>
                </div>
            </div>
        </>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getAllBlogPosts();
    return { paths: posts.map(p => ({ params: { slug: p.slug } })), fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const post = await getBlogPostBySlug(params?.slug as string);
    if (!post) return { notFound: true };
    const comments = await getCommentsByBlogId(post.id);
    
    const related = await getRelatedBlogs(post.id, post.category, 3);
    const popular = await getPopularBlogs(post.id, 3);
    
    return { props: { post, comments, relatedBlogs: related, popularBlogs: popular }, revalidate: 60 };
};

export default BlogDetailPage;
