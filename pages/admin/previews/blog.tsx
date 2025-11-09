
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost, Comment } from '../../../types';
import Ad from '../../../components/Ad';
import SEO from '../../../components/SEO';
import StarRating from '../../../components/StarRating';
import CommentCard from '../../../components/CommentCard';
import ShareBar from '../../../components/ShareBar';

const BlogPreviewPage: React.FC = () => {
    const [post, setPost] = useState<Partial<BlogPost>>({
        title: 'Blog Post Preview',
        summary: 'A summary of the blog post will appear here.',
        imageUrl: 'https://picsum.photos/seed/blog-placeholder/800/450',
        author: 'Author Name',
        publishDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        rating: 0,
        content: '<p>Start typing in the editor to see your blog post content live here.</p>',
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
        author: "Jane Doe",
        avatarUrl: "https://i.pravatar.cc/40?u=preview",
        date: "Just now",
        text: "This is a sample comment to show how the comment section will look.",
        status: 'approved',
        email: 'jane@example.com'
    };

    return (
        <>
            <SEO title={`Preview: ${post.title}`} noindex={true} />
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="hidden lg:block lg:col-span-2">
                    <div className="sticky top-24">
                        <Ad placement="blog_skyscraper_left" />
                    </div>
                </aside>
                
                <main className="col-span-12 lg:col-span-8">
                     <div className="mb-4">
                        <span className="text-sm text-purple-400 cursor-not-allowed">&lt; Back to Blog</span>
                    </div>
                    <header className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{post.title}</h1>
                        <div className="flex items-center text-sm text-gray-400">
                            <span>By {post.author}</span><span className="mx-2">&bull;</span><span>Published on {post.publishDate}</span>
                        </div>
                    </header>

                    <StarRating rating={post.rating || 0} size="large" className="mb-6" />

                    <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-8 shadow-lg relative">
                        {post.videoUrl ? 
                            <video key={post.videoUrl} src={post.videoUrl} controls autoPlay muted className="w-full h-full object-contain" /> : 
                            <Image key={post.imageUrl} src={post.imageUrl || 'https://picsum.photos/seed/blog-placeholder/800/450'} alt={post.title || ''} fill sizes="100vw" className="object-cover" />
                        }
                    </div>
                    
                    <article className="prose prose-invert prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content || '' }} />

                    {post.affiliateUrl && (
                        <div className="my-12 p-6 bg-gray-800 rounded-2xl text-center shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-2">Like what you see?</h3>
                            <p className="text-gray-400 mb-6">Explore it through the link below</p>
                            <a href={post.affiliateUrl} onClick={(e) => e.preventDefault()} className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg cursor-not-allowed">
                                Explore Here
                            </a>
                        </div>
                    )}
                    
                    <div className="my-12 lg:hidden">
                        <ShareBar title={post.title || ''} orientation="horizontal" />
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-6">Comments (Preview)</h2>
                        <div className="space-y-6">
                            <CommentCard comment={mockComment} />
                        </div>
                    </div>

                    <div className="mt-12">
                         <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
                            <h3 className="text-xl font-bold text-white">Comment Form Preview</h3>
                            <p className="text-gray-400 mt-2">The comment form will be displayed here on the live page.</p>
                         </div>
                    </div>
                </main>

                <aside className="hidden lg:block lg:col-span-2">
                    <div className="sticky top-24">
                        <div className="mb-8">
                            <ShareBar title={post.title || ''} orientation="vertical" />
                        </div>
                        <Ad placement="blog_skyscraper_right" />
                    </div>
                </aside>
            </div>
        </>
    );
};

export default BlogPreviewPage;
