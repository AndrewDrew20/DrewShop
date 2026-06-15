import React from 'react'
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect } from 'react';
import dealbg from '../FotosAshleyweb/banner1.jpg'

export const Banner = () => {
    useEffect(() => {
      AOS.init({
        offset: 100,
        duration: 500,
        easing: 'ease-in-out',
      });
      AOS.refresh();
    }, []);

  return (
    <div className='w-full lg:px-28 px-5 py-[80px]'>
      <div data-aos="zoom-in" className=' p-4 w-full h-[300px] rounded-lg bg-cover bg-center flex flex-col justify-center items-center gap-3' style={{ backgroundImage: `url(${dealbg})` }}>
        <h1 className='text-primary text-xl font-semibold'>Every Day shopping</h1>
        <h1 className='text-white font-bold text-[42px] leading-[50px] text-center '>Deal of the day</h1>
      </div>

    </div>
  )
}
export default Banner;