import React from 'react'
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect } from 'react';

import banner1 from '../FotosAshleyweb/WhatsApp Image 2026-04-21 at 8.07.22 PM.jpeg'
import banner2 from '../FotosAshleyweb/WhatsApp Image 2026-04-21 at 8.08.41 PM.jpeg'
import banner3 from '../FotosAshleyweb/WhatsApp Image 2026-04-21 at 8.13.59 PM.jpeg'


export const Types = () => {
   useEffect(() => {
        AOS.init({
          offset: 100,
          duration: 500,
          easing: 'ease-in-out',
        });
        AOS.refresh();
      }, []);
  return (
    <div  className='w-full lg:px-20 px-5 py-[80px] grid lg:grid-cols-3 grid-cols-1 justify-center items-start gap-10'>
      <div data-aos='zoom-in' data-aos-delay="100" className='flex flex-col justify-center items-end gap-6 bg-cover bg-center p-10 rounded-lg' style={{backgroundImage:`url(${banner1})`}} >
        <h1 className='text-primary border rounded-lg border-primary px-6 py-2 text-lg'>30% off</h1>
        <h1 className='text-end text-4xl text-white font-semibold'>Digital  <br />Illustration</h1>
      </div>
      <div data-aos='zoom-in' data-aos-delay="100" className='flex flex-col justify-center items-end gap-6 bg-cover bg-center p-10 rounded-lg' style={{backgroundImage:`url(${banner2})`}} >
        <h1 className='text-primary border rounded-lg border-primary px-6 py-2 text-lg'>15% off</h1>
        <h1 className='text-end text-4xl text-white font-semibold'>Traditional  <br />Canvas</h1>
      </div>
      <div data-aos='zoom-in' data-aos-delay="100" className='flex flex-col justify-center items-end gap-6 bg-cover bg-center p-10 rounded-lg' style={{backgroundImage:`url(${banner3})`}} >
        <h1 className='text-primary border rounded-lg border-primary px-6 py-2 text-lg'>40% off</h1>
        <h1 className='text-end text-4xl text-white font-semibold'>Alternative  <br />Surfaces</h1>
      </div>
    </div>
  )
}
export default Types;