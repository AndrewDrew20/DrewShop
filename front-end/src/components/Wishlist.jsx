import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format';

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { wishlist, remove, clear } = useWishlist();
  const { addToCart } = useCart();
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-6'>
        <div className='bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center'>
          <FaHeart className='text-5xl text-rose-400 mx-auto mb-4'/>
          <h2 className='text-xl font-bold text-gray-800 mb-2'>Sign in</h2>
          <p className='text-sm text-gray-500 mb-6'>
            You need an account to save your wishlist. That way you can access it from any device.
          </p>
          <button onClick={() => loginWithRedirect({ appState: { returnTo: '/wishlist' } })}
            className='bg-secondary text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition'>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-6 lg:px-16'>

      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
        <div className='flex flex-col gap-3'>
          <button onClick={() => navigate('/products')}
            className='flex items-center gap-2 text-gray-500 hover:text-secondary transition text-sm font-semibold w-fit'>
            <FaArrowLeft className='text-xs'/> Back to products
          </button>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>My Wishlist</h1>
            <p className='text-gray-400 text-sm mt-1'>
              {wishlist.length === 0 ? 'No saved items' : `${wishlist.length} saved item${wishlist.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
        {wishlist.length > 0 && (
          <button onClick={clear}
            className='flex items-center gap-2 text-red-400 hover:text-red-500 text-sm font-semibold transition w-fit'>
            <FaTrash className='text-xs'/> Clear list
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-32 text-gray-400'>
          <FaHeart className='text-6xl mb-4 text-rose-200'/>
          <p className='text-lg font-semibold'>Your wishlist is empty</p>
          <p className='text-sm mt-1 mb-6'>Tap the heart on any product to save it</p>
          <button onClick={() => navigate('/products')}
            className='bg-secondary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition'>
            Browse products
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {wishlist.map(p => (
            <div key={p._id}
              className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group'>
              <div
                onClick={() => navigate(`/products/${p._id}`)}
                className='relative h-48 bg-gray-50 overflow-hidden cursor-pointer'>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'/>
                  : <div className='w-full h-full flex items-center justify-center text-6xl'>📦</div>}
                <button
                  onClick={e => { e.stopPropagation(); remove(p._id); showToast('Removed from wishlist'); }}
                  className='absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-rose-500 hover:scale-110 transition'>
                  <FaHeart/>
                </button>
              </div>

              <div className='p-4 flex flex-col gap-3 flex-1'>
                <div onClick={() => navigate(`/products/${p._id}`)} className='cursor-pointer'>
                  <h3 className='font-bold text-gray-800 text-sm line-clamp-2'>{p.name}</h3>
                  <p className='text-gray-400 text-xs mt-1 line-clamp-2'>{p.description}</p>
                </div>

                <div className='flex items-center justify-between mt-auto'>
                  <span className='text-xl font-bold text-secondary'>{formatPrice(p.price)}</span>
                  <button
                    onClick={() => { addToCart(p, 1); showToast(`${p.name} added to cart ✓`); }}
                    className='flex items-center gap-2 bg-secondary text-white px-3 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition'>
                    <FaShoppingCart className='text-xs'/> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
