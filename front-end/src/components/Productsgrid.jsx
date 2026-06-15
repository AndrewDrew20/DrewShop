import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { FaStar, FaRegHeart, FaHeart } from 'react-icons/fa'
import { MdAddShoppingCart, MdOutlineRemoveRedEye } from 'react-icons/md'
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useCategories } from '../hooks/useCategories';
import { formatPrice } from '../utils/format';
import { API_URL } from '../utils/api';

const PRODUCTS_API = `${API_URL}/products`;

export const Productsgrid = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { addToCart } = useCart();
  const { has: inWishlist, toggle: toggleWishlist } = useWishlist();
  const { categories } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    AOS.init({ offset: 100, duration: 500, easing: 'ease-in-out' });
  }, []);

  useEffect(() => {
    fetch(PRODUCTS_API)
      .then(r => r.json())
      .then(data => setProducts((data || []).slice(0, 8)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // El wrapper de las tarjetas tiene data-aos="zoom-in", pero recién entra al
  // DOM cuando termina el fetch. Si AOS ya hizo su scan inicial mientras
  // estaba el spinner, el wrapper queda en opacity:0 y no ves nada. Forzar
  // refresh cuando el grid aparece arregla el render intermitente.
  useEffect(() => {
    if (!loading && products.length > 0) AOS.refresh();
  }, [loading, products.length]);

  const requireAuth = (action) => {
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: window.location.pathname + window.location.search } });
      return false;
    }
    action();
    return true;
  };

  return (
    <div id='products' className='w-full lg:px-20 px-5 py-[80px] bg-gray-100 flex flex-col justify-center items-center gap-4'>
      <h1 data-aos='zoom-in' data-aos-delay='100' className='text-secondary text-lg sm:text-xl font-semibold text-center'>Browse Collections</h1>
      <h1 data-aos='zoom-in' data-aos-delay='200' className='text-3xl sm:text-4xl lg:text-[42px] leading-tight lg:leading-[50px] font-semibold text-black text-center'>Trending products</h1>

      {loading ? (
        <div className='flex justify-center items-center py-20'>
          <div className='w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
        </div>
      ) : products.length === 0 ? (
        <p className='text-gray-400 text-sm py-10'>No products available yet.</p>
      ) : (
        <div
          className='w-full grid lg:grid-cols-4 grid-cols-1 gap-10 justify-center items-center mt-10'>
          {products.map((item, index) => {
            const rating = Math.round(item.rating || 0);
            const saved = inWishlist(item._id);
            return (
              <div id='product-box' key={item._id || index}
                className='flex flex-col justify-center items-center gap-2 bg-white p-4 rounded-lg cursor-pointer relative'
                onClick={() => navigate(`/products/${item._id}`)}>

                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className='w-full aspect-square object-cover rounded-lg'/>
                ) : (
                  <div className='w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-6xl'>
                    📦
                  </div>
                )}

                <div id='icons' className='flex justify-center items-center gap-3 absolute top-[20px]'>
                  <div onClick={(e) => { e.stopPropagation(); navigate(`/products/${item._id}`); }}
                    className='bg-secondary hover:bg-primary hover:text-black rounded-full p-2 sm:p-3 text-white text-sm sm:text-base'>
                    <MdOutlineRemoveRedEye/>
                  </div>
                  <div onClick={(e) => {
                    e.stopPropagation();
                    if (!isAuthenticated) {
                      loginWithRedirect({ appState: { returnTo: window.location.pathname } });
                      return;
                    }
                    toggleWishlist(item);
                  }}
                    className='bg-secondary hover:bg-primary hover:text-black rounded-full p-2 sm:p-3 text-white text-sm sm:text-base'>
                    {saved ? <FaHeart className='text-rose-300'/> : <FaRegHeart/>}
                  </div>
               
                </div>

                <h1 className='text-lg text-gray-400 font-semibold'>
                  {categories.find(c => c._id === item.id_category)?.name || 'Uncategorized'}
                </h1>
                <h1 className='text-xl text-black font-semibold text-center line-clamp-1'>{item.name}</h1>
                <h1 className='text-lg text-secondary font-semibold'>{formatPrice(item.price)}</h1>

                <div className='w-full mt-2'>
                  <hr/>
                  <div className='flex justify-between items-center gap-6 mt-3'>
                    <div className='flex justify-start items-center gap-1'>
                      {[1,2,3,4,5].map(star => (
                        <FaStar key={star} className={star <= rating ? 'text-secondary' : 'text-gray-300'}/>
                      ))}
                    </div>
                    {item.stock > 0
                      ? <button className='bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-[13px] font-semibold whitespace-nowrap'>IN STOCK</button>
                      : <button className='bg-gray-400 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-[13px] font-semibold whitespace-nowrap'>SOLD OUT</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => navigate('/products')}
        data-aos='zoom-in' data-aos-delay='400'
        className='bg-secondary hover:bg-primary text-white hover:text-black font-semibold px-8 py-3 rounded-lg mt-8'>
        VIEW MORE
      </button>
    </div>
  )
}
export default Productsgrid
