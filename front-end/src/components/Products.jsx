import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { FaSearch, FaStar, FaShoppingCart, FaFilter, FaTimes, FaHeart, FaRegHeart } from 'react-icons/fa';
import { MdSort } from 'react-icons/md';
import { useCart } from '../hooks/useCart';
import { useCategories } from '../hooks/useCategories';
import { useWishlist } from '../hooks/useWishlist';
import { formatPrice } from '../utils/format';
import { API_URL } from '../utils/api';

const API = `${API_URL}/products`;





const SORT_OPTIONS = [
  { value: '',           label: 'Relevance' },
  { value: 'price-asc',  label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating',     label: 'Top rated' },
];

export default function Products() {
  const { categories } = useCategories();
  const { addToCart } = useCart();
  const { has: inWishlist, toggle: toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const allCategories = [{ _id: '', name: 'all' }, ...categories];
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState(searchParams.get('search') || '');
  const [category, setCategory]       = useState(searchParams.get('category') || '');
  const [sort, setSort]               = useState('');
  const [priceRange, setPriceRange]   = useState([0, 5000]);
  const [maxPrice, setMaxPrice]       = useState(5000);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast]             = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res  = await fetch(API);
        const data = await res.json();
        setProducts(data);
        const max = Math.max(...data.map(p => p.price || 0));
        setMaxPrice(max);
        setPriceRange([0, max]);
      } catch {
        showToast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Mantener el query param `?search=` en sincronía con el input
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== search) setSearch(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (search) params.set('search', search); else params.delete('search');
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Sign in to save items to your wishlist', 'error');
      setTimeout(() => loginWithRedirect({ appState: { returnTo: window.location.pathname + window.location.search } }), 1500);
      return;
    }
    const wasIn = inWishlist(product._id);
    toggleWishlist(product);
    showToast(wasIn ? 'Removed from wishlist' : 'Added to wishlist ❤');
  };

  // ✅ Una sola versión limpia de handleAddToCart
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('You must sign in to add items to your cart', 'error');
      setTimeout(() => loginWithRedirect({ appState: { returnTo: window.location.pathname + window.location.search } }), 1500);
      return;
    }
    addToCart(product, 1);
    showToast(`${product.name} added to cart ✓`);
  };

  const filtered = products
    .filter(p => {
      const matchSearch   = p.name?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category ? p.id_category === category : true;
      const matchPrice    = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchSearch && matchCategory && matchPrice;
    })
    .sort((a, b) => {
      if (sort === 'price-asc')  return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating')     return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
    setPriceRange([0, maxPrice]);
  };

  const hasActiveFilters = search || category || sort || priceRange[1] < maxPrice;

  return (
    <div className='min-h-screen bg-gray-50'>

      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Hero banner */}
      <div className='bg-secondary py-14 px-6 lg:px-16 text-white'>
        <h1 className='text-4xl font-bold mb-2'>Products</h1>
        <p className='text-white text-opacity-80 text-sm'>
          {loading ? 'Loading...' : `${filtered.length} products found`}
        </p>
        <div className='relative mt-6 max-w-xl'>
          <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'/>
          <input
            type='text'
            placeholder='Search products...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='w-full pl-11 pr-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white'
          />
        </div>
      </div>

      <div className='lg:px-16 px-6 py-8'>

        {/* Filter bar */}
        <div className='flex flex-wrap items-center gap-3 mb-6'>
          <div className='flex gap-2 flex-wrap'>
  {allCategories.map(cat => (
    <button
      key={cat._id}
      onClick={() => setCategory(cat._id)}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
        ${category === cat._id
          ? 'bg-secondary text-white'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-secondary hover:text-secondary'
        }`}
    >
      {cat.name}
    </button>
  ))}
</div>

          <div className='ml-auto flex items-center gap-3'>
            <div className='relative'>
              <MdSort className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'/>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className='pl-8 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer'
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition
                ${showFilters ? 'bg-secondary text-white border-secondary' : 'bg-white border-gray-200 text-gray-600 hover:border-secondary'}`}
            >
              <FaFilter className='text-xs'/> Price
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters}
                className='flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-semibold'>
                <FaTimes className='text-xs'/> Clear
              </button>
            )}
          </div>
        </div>

        {/* Price range */}
        {showFilters && (
          <div className='bg-white rounded-2xl border border-gray-100 p-5 mb-6 max-w-sm'>
            <p className='text-sm font-semibold text-gray-700 mb-3'>
              Price range: <span className='text-secondary'>{formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}</span>
            </p>
            <input
              type='range' min={0} max={maxPrice} step={10}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              className='w-full accent-secondary'
            />
            <div className='flex justify-between text-xs text-gray-400 mt-1'>
              <span>{formatPrice(0)}</span><span>{formatPrice(maxPrice)}</span>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className='flex justify-center items-center py-32'>
            <div className='w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-32 text-gray-400'>
            <FaSearch className='text-5xl mb-4'/>
            <p className='text-lg font-semibold'>No products found</p>
            <p className='text-sm mt-1'>Try different filters</p>
            <button onClick={clearFilters} className='mt-4 text-secondary font-semibold hover:underline'>
              Clear filters
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {filtered.map(product => (
              <div
                key={product._id}
                onClick={() => navigate(`/products/${product._id}`)}
                className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 group'
              >
                <div className='relative h-48 bg-gray-50 overflow-hidden'>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'/>
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <span className='text-6xl'>📦</span>
                    </div>
                  )}
                  <span className='absolute top-3 left-3 bg-secondary text-white text-xs font-semibold px-2 py-1 rounded-full'>
                    {categories.find(c => c._id === product.id_category)?.name || product.id_category}
                  </span>
                  <button
                    onClick={(e) => handleWishlistToggle(e, product)}
                    className='absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition hover:scale-110'
                    aria-label='Save to wishlist'
                  >
                    {inWishlist(product._id)
                      ? <FaHeart className='text-rose-500'/>
                      : <FaRegHeart className='text-gray-400'/>}
                  </button>
                  {product.stock < 5 && product.stock > 0 && (
                    <span className='absolute bottom-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow'>
                      Only {product.stock} left!
                    </span>
                  )}
                  {product.stock === 0 && (
                    <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
                      <span className='bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-full'>Sold out</span>
                    </div>
                  )}
                </div>

                <div className='p-4'>
                  <h3 className='font-bold text-gray-800 text-sm mb-1 line-clamp-2'>{product.name}</h3>
                  <p className='text-gray-400 text-xs mb-3 line-clamp-2'>{product.description}</p>

                  {product.rating != null && (
                    <div className='flex items-center gap-1 mb-3'>
                      {[1,2,3,4,5].map(star => (
                        <FaStar key={star}
                          className={`text-xs ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}/>
                      ))}
                      <span className='text-xs text-gray-400 ml-1'>{product.rating}</span>
                    </div>
                  )}

                  <div className='flex items-center justify-between gap-2 mt-auto'>
                    <span className='text-base sm:text-xl font-bold text-secondary truncate'>{formatPrice(product.price)}</span>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                      className='flex items-center gap-1.5 bg-secondary text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0'
                    >
                      <FaShoppingCart className='text-xs'/> <span className='hidden sm:inline'>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}