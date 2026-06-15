import React, { useEffect } from 'react'
import 'aos/dist/aos.css';
import AOS from 'aos';

const ashleyImages = Object.values(
  import.meta.glob('../FotosAshleyweb/*.jpeg', { eager: true, query: '?url', import: 'default' })
);

export const Insta = () => {

  useEffect(() => {
    AOS.init({ offset: 100, duration: 500, easing: 'ease-in-out' });
    AOS.refresh();
  }, []);

  const photos = ashleyImages.slice(19, 25);

  return (
    <div className='w-full lg:px-20 px-5 py-[80px] bg-white flex flex-col justify-center items-center gap-4'>
      <h1 data-aos='zoom-in' data-aos-delay='100' className='text-secondary text-xl font-semibold capitalize'>Our Instagram Shop</h1>
      <h1 data-aos='zoom-in' data-aos-delay='200' className='text-black font-semibold text-[42] leading-[50px] text-center capitalize'>Follow on Instagram </h1>
      <div data-aos='zoom-in' data-aos-delay='300' className='w-full grid lg:grid-cols-6 grid-cols-2 justify-center items-center gap-6 mt-8'>
        {photos.map((src, i) => (
          <img key={i} src={src} alt={`insta-${i}`} className='rounded-lg w-full aspect-square object-cover'/>
        ))}
      </div>
      <a
        href='https://www.instagram.com/'
        target='_blank'
        rel='noreferrer'
        data-aos='zoom-in' data-aos-delay='400'
        className='bg-secondary hover:bg-primary text-white hover:text-black font-semibold py-3 px-8 rounded mt-12 uppercase'>
        FOLLOW US
      </a>
    </div>
  )
}
export default Insta;
