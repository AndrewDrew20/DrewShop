import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useCategories } from '../hooks/useCategories';

const ashleyImages = Object.values(
  import.meta.glob('../FotosAshleyweb/*.jpeg', { eager: true, query: '?url', import: 'default' })
);

export const Category = () => {
  const navigate = useNavigate();
  const { categories, loading } = useCategories();

  useEffect(() => {
    AOS.init({ offset: 100, duration: 500, easing: 'ease-in-out' });
    AOS.refresh();
  }, []);

  // Reservar un offset para no chocar con las imágenes de "Trending products"
  const PRODUCT_GRID_SIZE = 8;
  const imageFor = (index) =>
    ashleyImages[(PRODUCT_GRID_SIZE + index) % ashleyImages.length];

  const display = (categories || []).slice(0, 5);
  const goToCategory = (id) => navigate(`/products?category=${encodeURIComponent(id)}`);

  return (
    <div id='category' className='w-full bg-gray-100 lg:px-20 px-5 pt-32.5 pb-20 flex lg:flex-row flex-col justify-center items-center gap-20'>
      <div data-aos='zoom-in' data-aos-delay='50'
        className='lg:w-[15%] w-full flex flex-col justify-center lg:items-start items-center gap-[20px]'>
        <h1 className='text-secondary text-xl font-semibold text-center'>Favorite Items</h1>
        <h1 className='text-black font-semibold text-[42px] leading-[50px] lg:text-start text-center'>Popular Category</h1>
        <button
          onClick={() => navigate('/products')}
          className='bg-secondary hover:bg-primary text-white hover:text-black px-8 py-3 rounded-lg font-semibold mt-[60px]'>
          VIEW ALL
        </button>
      </div>

      <div className='lg:w-[85%] w-full grid lg:grid-cols-5 grid-cols-2 justify-center items-start gap-10'>
        {loading ? (
          <div className='col-span-full flex justify-center py-10'>
            <div className='w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
          </div>
        ) : display.length === 0 ? (
          <p className='col-span-full text-center text-gray-400 text-sm py-10'>
            No categories available yet.
          </p>
        ) : (
          display.map((cat, i) => (
            <div
              key={cat._id}
              onClick={() => goToCategory(cat._id)}
              data-aos='zoom-in' data-aos-delay={100 * (i + 1)}
              className='flex flex-col justify-center items-center gap-6 cursor-pointer group'>
              <img
                src={imageFor(i)}
                alt={cat.name}
                className='rounded-full aspect-square object-cover w-40 h-40 group-hover:scale-105 transition-transform duration-300'/>
              <h1 className='text-black text-lg font-semibold group-hover:text-secondary text-center'>
                {cat.name}
              </h1>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
export default Category;
