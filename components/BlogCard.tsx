import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '../types';
import StarRating from './StarRating';

interface BlogCardProps {
    post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <Link 
            href={`/blog/${post.slug}`} 
            prefetch={false}
            className="group relative block w-full bg-gray-900 rounded-2xl overflow-hidden ring-1 ring-white/5 hover:ring-2 hover:ring-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 ease-out hover:-translate-y-2 h-full flex flex-col"
        >
            {/* Image Section with Overlay */}
            <div className="aspect-[16/9] relative overflow-hidden">
                {!imageError ? (
                    <Image 
                        src={post.imageUrl} 
                        alt={post.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        onError={() => setImageError(true)} 
                    />
                ) : (
                    <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        referrerPolicy="no-referrer"
                    />
                )}
                {/* Dark Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                     <span className="inline-flex items-center px-3 py-1 bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg border border-purple-400/30 skew-x-[-10deg]">
                        <span className="skew-x-[10deg]">{post.category}</span>
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow relative z-10 -mt-6">
                <div className="bg-gray-900 absolute inset-0 transform -skew-y-2 origin-top-left translate-y-6 z-[-1] border-t border-white/5 group-hover:border-purple-500/30 transition-colors" />
                
                <h3 className="text-xl md:text-2xl font-black text-white mb-3 uppercase leading-tight tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all line-clamp-2 drop-shadow-sm">
                    {post.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                    {post.summary}
                </p>
                
                <div className="mt-auto flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-500 border-t border-gray-800 pt-4">
                    <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                        <span>{post.author}</span>
                        <span className="text-purple-600">•</span>
                        <span>{post.publishDate}</span>
                    </div>
                    {post.rating > 0 && (
                        <div className="transform scale-90 origin-right">
                            <StarRating rating={post.rating} />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;