import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import type { BlogPost } from '../../types';
import { getAllBlogPosts } from '../../lib/data';
import BlogCard from '../../components/BlogCard';
import FilterButton from '../../components/FilterButton';

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
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-purple-500 selection:text-white">
            {/* --- Page Header --- */}
            <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
                {/* Background Glow */}
                <div className="absolute top-0 right-1/4 w-3/4 h-64 bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
                    <div>
                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-2 uppercase leading-[0.8]">
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient-x">Journal</span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl font-bold uppercase tracking-widest mt-6 max-w-xl flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-pink-500 inline-block"></span>
                            Guides . Reviews . Culture
                        </p>
                    </div>
                </div>

                {/* --- Filter & Search Bar --- */}
                <div className="sticky top-20 z-30 bg-[#0d0d0d]/80 backdrop-blur-xl border-y border-white/5 py-4 -mx-4 px-4 sm:px-0 sm:mx-0 sm:border-0 sm:mb-12">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        
                        {/* Categories Scrollable Area */}
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 hidden lg:block shrink-0">Topics //</span>
                            {categories.map(cat => (
                                <FilterButton 
                                    key={cat} 
                                    label={cat} 
                                    isActive={selectedCategory === cat} 
                                    onClick={() => handleCategorySelect(cat)} 
                                />
                            ))}
                        </div>

                        {/* Filter Status */}
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
                            {areFiltersActive ? (
                                <span>Found <span className="text-pink-400">{filteredPosts.length}</span> articles</span>
                            ) : (
                                <span>Archive: <span className="text-white">{posts.length}</span> articles</span>
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
                    <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/50">
                        <div className="bg-gray-800 p-6 rounded-full mb-6 ring-4 ring-gray-800/50">
                            <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m-1 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-1-5h.01" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black uppercase text-white mb-2 tracking-tight">Archives Empty</h3>
                        <p className="text-gray-400 font-medium max-w-md mb-8">
                            No articles found matching "{searchQuery}" or the selected category.
                        </p>
                        <button 
                            onClick={() => router.push('/blog')}
                            className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-sm skew-x-[-10deg] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1"
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