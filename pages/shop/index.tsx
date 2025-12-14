
import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import type { Product } from '../../types';
import { getAllProducts } from '../../lib/data';
import StoreItemCard from '../../components/StoreItemCard';
import FilterButton from '../../components/FilterButton';
import SponsoredShopCard from '../../components/SponsoredShopCard';

interface ShopProps {
  searchQuery: string;
  products: Product[];
}

const Shop: React.FC<ShopProps> = ({ searchQuery, products }) => {
  const router = useRouter();
  const selectedCategory = (router.query.category as string) || 'All';

  // --- Pagination State ---
  const ITEMS_PER_BATCH = 30;
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_BATCH);

  // Extract unique categories
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  
  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesQuery && matchesCategory;
    });
  }, [products, selectedCategory, searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayLimit(ITEMS_PER_BATCH);
  }, [searchQuery, selectedCategory]);

  // Slice for display
  const visibleProducts = filteredProducts.slice(0, displayLimit);
  const hasMoreProducts = filteredProducts.length > displayLimit;

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + ITEMS_PER_BATCH);
  };
  
  const handleCategorySelect = (cat: string) => {
    const newQuery = { ...router.query };
    if (cat === 'All' || cat === selectedCategory) {
        delete newQuery.category;
    } else {
        newQuery.category = cat;
    }
    router.push({ pathname: '/shop', query: newQuery }, undefined, { shallow: true });
  };
  
  const areFiltersActive = searchQuery || (selectedCategory && selectedCategory !== 'All');

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-green-500 selection:text-white">
        {/* --- Page Header --- */}
        <div className="relative pt-16 pb-8 md:pt-20 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full md:w-3/4 h-48 md:h-64 bg-green-900/10 blur-[80px] md:blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12 border-b border-white/5 pb-6 md:pb-8">
                <div>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-2 uppercase leading-[0.9] md:leading-[0.8]">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-x">Store</span>
                    </h1>
                    <p className="text-gray-400 text-sm md:text-xl font-bold uppercase tracking-widest mt-4 md:mt-6 max-w-xl flex items-center gap-2 md:gap-3">
                        <span className="w-4 md:w-8 h-[2px] bg-blue-500 inline-block"></span>
                        Gear . Merch . Upgrades
                    </p>
                </div>
            </div>

            {/* --- Filter & Search Bar --- */}
            <div className="sticky top-16 md:top-20 z-30 bg-[#0d0d0d]/80 backdrop-blur-xl border-y border-white/5 py-3 md:py-4 -mx-4 px-4 sm:px-0 sm:mx-0 sm:border-0 mb-8 md:mb-12">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between">
                    
                    {/* Categories Scrollable Area */}
                    <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 hidden lg:block shrink-0">Collections //</span>
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
                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap bg-gray-900 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-800 self-end md:self-auto">
                        {areFiltersActive ? (
                            <span>Found <span className="text-green-400">{filteredProducts.length}</span> items</span>
                        ) : (
                            <span>Inventory: <span className="text-white">{products.length}</span> items</span>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Product Grid --- */}
            {filteredProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 gap-y-6 md:gap-y-10">
                        {visibleProducts.map((product, index) => (
                            <React.Fragment key={product.id}>
                                <StoreItemCard product={product} />
                                {/* Insert Sponsored Card after every 4th item */}
                                {(index + 1) % 4 === 0 && <SponsoredShopCard />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Load More Button */}
                    {hasMoreProducts && (
                        <div className="mt-12 flex justify-center pb-8">
                            <button 
                                onClick={handleLoadMore}
                                className="group relative px-8 py-3 bg-gray-900 border border-green-500/30 rounded-xl hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/20 active:scale-95"
                            >
                                <span className="text-sm font-black text-white uppercase tracking-widest group-hover:text-green-400 transition-colors">
                                    Load More Gear
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                // Empty State
                <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/50">
                    <div className="bg-gray-800 p-4 md:p-6 rounded-full mb-4 md:mb-6 ring-4 ring-gray-800/50">
                        <svg className="w-10 h-10 md:w-16 md:h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h3 className="text-xl md:text-3xl font-black uppercase text-white mb-2 tracking-tight">Out of Stock</h3>
                    <p className="text-gray-400 text-sm md:text-base font-medium max-w-xs md:max-w-md mb-6 md:mb-8">
                        No products found matching "{searchQuery}" or the selected category.
                    </p>
                    <button 
                        onClick={() => router.push('/shop')}
                        className="px-8 py-3 md:px-10 md:py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs md:text-sm skew-x-[-10deg] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1"
                    >
                        <span className="block skew-x-[10deg]">Reset Store</span>
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
    const products = await getAllProducts();
    return {
        props: {
            products,
        },
        revalidate: 60,
    };
};

export default Shop;
