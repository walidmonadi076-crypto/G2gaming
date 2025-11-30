
import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import type { BlogPost } from '../../types';
import { getAllBlogPosts } from '../../lib/data';
import StarRating from '../../components/StarRating';

// --- Components matching Games Page Style ---

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
            relative px-5 py-2 text-xs font-black uppercase tracking-widest rounded-sm transition-all duration-300 border skew-x-[-10deg]
            ${isActive 
                ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.6)]' 
                : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-purple-500 hover:text-white hover:bg-gray-800'
            }
        `}
    >
        <span className="block skew-x-[10deg]">{label}</span>
    </button>
);

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => (
    <Link 
        href={`/blog/${post.slug}`} 
        className="group relative block w-full bg-gray-900 rounded-xl overflow-hidden ring-0 hover:ring-2 hover:ring-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 h-full flex flex-col"
    >
        {/* Image Section */}
        <div className="aspect-video relative overflow-hidden">
            <Image 
                src={post.imageUrl} 
                alt={post.title} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90" />
            
            {/* Category Tag (Floating) */}
            <div className="absolute top-3 left-3">
                 <span className="inline-block px-2 py-1 bg-purple-600/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-lg border border-purple-500/50 skew-x-[-10deg]">
                    <span className="block skew-x-[10deg]">{post.category}</span>
                </span>
            </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow relative z-10 -mt-8">
            <h3 className="text-xl font-black text-white mb-3 uppercase leading-tight tracking-tight group-hover:text-purple-400 transition-colors line-clamp-2 drop-shadow-md">
                {post.title}
            </h3>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow font-medium line-clamp-3">
                {post.summary}
            </p>
            
            <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-500">
                <div className="flex items-center gap-2">
                    <span className="text-white">{post.author}</span>
                    <span className="text-purple-500">•</span>
                    <span>{post.publishDate}</span>
                </div>
                {post.rating > 0 && (
                    <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-sm">
                        <span className="text-yellow-400">★</span>
                        <span className="text-white">{post.rating}</span>
                    </div>
                )}
            </div>
        </div>
    </Link>
);

interface BlogsPageProps {
    searchQuery: string;
    posts: BlogPost[];
}

const BlogsPage: React.FC<BlogsPageProps> = ({ searchQuery, posts }) => {
    const router = useRouter();
    const selectedCategory = (router.query.category as string) || 'All';

    // Extract unique categories
    const categories = useMemo(() => ['All', ...Array.from(new Set(posts.map(p => p.category)))], [posts]);

    // Filter Logic
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesQuery = post.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
            return matchesQuery && matchesCategory;
        });
    }, [posts, selectedCategory, searchQuery]);

    const handleCategorySelect = (cat: string) => {
        const newQuery = { ...router.query };
        if (cat === 'All' || cat === selectedCategory) {
            delete newQuery.category;
        } else {
            newQuery.category = cat;
        }
        router.push({ pathname: '/blog', query: newQuery }, undefined, { shallow: true });
    };

    const areFiltersActive = searchQuery || (selectedCategory && selectedCategory !== 'All');

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
            {/* --- Page Header --- */}
            <div className="relative pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-2 uppercase leading-[0.85]">
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient-x">Journal</span>
                        </h1>
                        <p className="text-blue-200/80 text-lg md:text-xl font-bold uppercase tracking-widest mt-4 max-w-xl">
                            // Guides . Reviews . Culture
                        </p>
                        {/* Decorative Elements */}
                        <div className="h-1.5 w-32 bg-purple-600 mt-6 shadow-[0_0_20px_#9333ea]"></div>
                    </div>
                </div>

                {/* --- Filter & Search Bar --- */}
                <div className="sticky top-20 z-30 backdrop-blur-xl bg-[#0d0d0d]/90 border-y border-gray-800 py-4 -mx-4 px-4 sm:px-0 sm:mx-0 sm:border-0 sm:mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        
                        {/* Categories Scrollable Area */}
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest mr-2 hidden sm:block">Filter_By //</span>
                            {categories.map(cat => (
                                <FilterButton 
                                    key={cat} 
                                    label={cat} 
                                    isActive={selectedCategory === cat} 
                                    onClick={() => handleCategorySelect(cat)} 
                                />
                            ))}
                        </div>

                        {/* Filter Status / Result Count */}
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                            {areFiltersActive ? (
                                <span>Found <span className="text-white">{filteredPosts.length}</span> articles</span>
                            ) : (
                                <span>Library: <span className="text-white">{posts.length}</span> articles</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Content Grid --- */}
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map(post => <BlogCard key={post.id} post={post} />)}
                    </div>
                ) : (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                        <div className="bg-gray-800/50 p-6 rounded-full mb-4">
                            <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m-1 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-1-5h.01" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black uppercase text-white mb-2 tracking-tight">System Empty</h3>
                        <p className="text-gray-400 font-medium max-w-md mb-6">
                            No articles found matching "{searchQuery}" or the selected category.
                        </p>
                        <button 
                            onClick={() => router.push('/blog')}
                            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-sm skew-x-[-10deg] transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                        >
                            <span className="block skew-x-[10deg]">Reset Filters</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const posts = await getAllBlogPosts();
    return {
        props: {
            posts,
        },
        revalidate: 60,
    };
};

export default BlogsPage;
