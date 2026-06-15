import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { FaStar, FaShoppingCart, FaArrowLeft, FaBox, FaTag, FaUser, FaPaperPlane, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useCart } from '../hooks/useCart';
import { useCategories } from '../hooks/useCategories';
import { useWishlist } from '../hooks/useWishlist';
import { formatPrice } from '../utils/format';
import { API_URL } from '../utils/api';
const API = `${API_URL}/products`;
const PURCHASES_API = `${API_URL}/purchases`;

export default function ProductDetail() {
  const { categories } = useCategories();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect, user, getAccessTokenSilently } = useAuth0();
  const { addToCart } = useCart();
  const { has: inWishlist, toggle: toggleWishlist } = useWishlist();

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [qty, setQty]               = useState(1);
  const [toast, setToast]           = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProduct = async () => {
    try {
      const res  = await fetch(`${API}/${id}`);
      const data = await res.json();
      setProduct(data);
    } catch {
      showToast('Failed to load product', 'error');
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchProduct();
      setLoading(false);
    })();
  }, [id]);

  // Verificar si el usuario compró el producto.
  // Tras el lockdown de auth, GET /purchases requiere token: admin ve todo,
  // user sólo ve sus propios pedidos. Por eso pasamos el bearer.
  useEffect(() => {
    if (!isAuthenticated || !user) { setHasPurchased(false); return; }
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(PURCHASES_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setHasPurchased(false); return; }
        const purchases = await res.json();
        const bought = purchases.some(p => p.id_Product === id && p.id_User === user.sub);
        setHasPurchased(bought);
      } catch {
        setHasPurchased(false);
      }
    })();
  }, [isAuthenticated, user, id, getAccessTokenSilently]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showToast('You must sign in to add items to your cart', 'error');
      setTimeout(() => loginWithRedirect({ appState: { returnTo: window.location.pathname + window.location.search } }), 1500);
      return;
    }
    addToCart(product, qty);
    showToast(`${product.name} added to cart ✓`);
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      showToast('Sign in to save items to your wishlist', 'error');
      setTimeout(() => loginWithRedirect({ appState: { returnTo: window.location.pathname + window.location.search } }), 1500);
      return;
    }
    const wasIn = inWishlist(product._id);
    toggleWishlist(product);
    showToast(wasIn ? 'Removed from wishlist' : 'Added to wishlist ❤');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API}/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: reviewForm.rating, comment: reviewForm.comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setProduct(data);
      setReviewForm({ rating: 5, comment: '' });
      showToast('Review posted ✓');
    } catch (err) {
      showToast(err.message || 'Failed to post review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
    </div>
  );

  if (!product) return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4'>
      <p className='text-gray-500 text-lg'>Product not found</p>
      <button onClick={() => navigate('/products')}
        className='text-secondary font-semibold hover:underline'>
        Back to products
      </button>
    </div>
  );

  const categoryLabel = categories.find(c => c._id === product.id_category)?.name || product.id_category;
  const alreadyReviewed = (product.reviews || []).some(r => r.auth0Id === user?.sub);

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-6 lg:px-16'>

      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <button onClick={() => navigate('/products')}
        className='flex items-center gap-2 text-gray-500 hover:text-secondary transition mb-8 text-sm font-semibold'>
        <FaArrowLeft className='text-xs'/> Back to products
      </button>

      <div className='max-w-5xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden'>
        <div className='grid grid-cols-1 lg:grid-cols-2'>

          <div className='bg-gray-50 flex items-center justify-center p-10 min-h-[350px]'>
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} className='max-h-80 object-contain'/>
              : <span className='text-9xl'>📦</span>
            }
          </div>

          <div className='p-8 flex flex-col gap-5'>
            <div className='flex items-center gap-2'>
              <FaTag className='text-secondary text-xs'/>
              <span className='text-secondary text-sm font-semibold'>{categoryLabel}</span>
            </div>

            <h1 className='text-2xl font-bold text-gray-800 leading-tight'>{product.name}</h1>

            {product.rating > 0 && (
              <div className='flex items-center gap-2'>
                <div className='flex gap-1'>
                  {[1,2,3,4,5].map(star => (
                    <FaStar key={star}
                      className={`text-sm ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}/>
                  ))}
                </div>
                <span className='text-sm text-gray-500 font-medium'>
                  {product.rating} / 5 · {product.reviews?.length || 0} review{product.reviews?.length === 1 ? '' : 's'}
                </span>
              </div>
            )}

            <p className='text-gray-500 text-sm leading-relaxed'>{product.description}</p>

            <div className='flex items-center gap-2'>
              <FaBox className={`text-sm ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}/>
              <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
              </span>
            </div>

            <div className='text-3xl font-bold text-secondary'>{formatPrice(product.price)}</div>

            {product.stock > 0 && (
              <div className='flex flex-wrap items-center gap-3'>
                <div className='flex items-center border border-gray-200 rounded-xl overflow-hidden'>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className='px-4 py-2 text-gray-600 hover:bg-gray-50 transition font-bold text-lg'>−</button>
                  <span className='px-4 py-2 font-semibold text-gray-800 min-w-[40px] text-center'>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className='px-4 py-2 text-gray-600 hover:bg-gray-50 transition font-bold text-lg'>+</button>
                </div>

                <button onClick={handleAddToCart}
                  className='flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-secondary text-white py-3 px-4 rounded-xl font-semibold hover:bg-opacity-90 transition'>
                  <FaShoppingCart/> Add to cart
                </button>

                <button
                  onClick={handleWishlist}
                  aria-label='Save to wishlist'
                  className='w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 transition shrink-0'
                >
                  {inWishlist(product._id)
                    ? <FaHeart className='text-rose-500'/>
                    : <FaRegHeart className='text-gray-500'/>}
                </button>
              </div>
            )}

            {product.stock > 0 && qty > 1 && (
              <p className='text-sm text-gray-400'>
                Total: <span className='font-bold text-gray-700'>{formatPrice(product.price * qty)}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className='max-w-5xl mx-auto mt-8'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>
          Reviews <span className='text-gray-400 font-normal text-sm'>({product.reviews?.length || 0})</span>
        </h2>

        {/* Review form */}
        {isAuthenticated && hasPurchased && !alreadyReviewed && (
          <form onSubmit={handleReviewSubmit} className='bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col gap-4'>
            <h3 className='font-bold text-gray-800'>Leave your review</h3>

            <div>
              <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block'>Rating</label>
              <div className='flex gap-1'>
                {[1,2,3,4,5].map(star => (
                  <button key={star} type='button'
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className='text-2xl hover:scale-110 transition'>
                    <FaStar className={star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-200'}/>
                  </button>
                ))}
                <span className='ml-3 text-sm text-gray-500 self-center'>{reviewForm.rating} / 5</span>
              </div>
            </div>

            <div>
              <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows={3}
                placeholder='Tell us what you thought of the product...'
                className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none'
              />
            </div>

            <div className='flex justify-end'>
              <button type='submit' disabled={submittingReview}
                className='flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition disabled:opacity-50'>
                {submittingReview
                  ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'/>
                  : <FaPaperPlane className='text-xs'/>}
                Post review
              </button>
            </div>
          </form>
        )}

        {isAuthenticated && !hasPurchased && (
          <div className='bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 mb-6 text-sm text-blue-700'>
            Only buyers of this product can leave a review.
          </div>
        )}

        {isAuthenticated && hasPurchased && alreadyReviewed && (
          <div className='bg-green-50 border border-green-100 rounded-2xl px-6 py-4 mb-6 text-sm text-green-700'>
            You already reviewed this product ✓
          </div>
        )}

        {!isAuthenticated && (
          <div className='bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 mb-6 text-sm text-gray-600'>
            <button onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname + window.location.search } })} className='text-secondary font-semibold hover:underline'>
              Sign in
            </button> to leave a review.
          </div>
        )}

        {/* Reviews list */}
        {!product.reviews || product.reviews.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400'>
            No reviews yet. Be the first!
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {product.reviews.slice().reverse().map(r => (
              <div key={r._id} className='bg-white rounded-2xl shadow-sm p-5'>
                <div className='flex items-start justify-between gap-3 mb-2'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-secondary bg-opacity-10 text-secondary flex items-center justify-center'>
                      <FaUser className='text-xs'/>
                    </div>
                    <div>
                      <p className='font-semibold text-gray-800 text-sm'>{r.userName}</p>
                      <p className='text-xs text-gray-400'>
                        {new Date(r.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-0.5'>
                    {[1,2,3,4,5].map(star => (
                      <FaStar key={star}
                        className={`text-xs ${star <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}/>
                    ))}
                  </div>
                </div>
                {r.comment && (
                  <p className='text-sm text-gray-600 leading-relaxed mt-2'>{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
