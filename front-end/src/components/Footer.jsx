import React, { useEffect } from 'react'
import client1 from '../assets/client1.png'
import client2 from '../assets/client2.png'
import client3 from '../assets/client3.png'
import client4 from '../assets/client4.png'
import client5 from '../assets/client5.png'
import client6 from '../assets/client6.png'
import google from '../assets/google.jpg'
import apple from '../assets/apple.jpg'
import pay1 from '../assets/pay-1.jpg'
import pay2 from '../assets/pay-2.jpg'
import pay3 from '../assets/pay-3.jpg'
import pay4 from '../assets/pay-4.jpg'
import { Link } from 'react-scroll'
import { FaArrowUp, FaLinkedin, FaInstagram, FaCode } from 'react-icons/fa'
import 'aos/dist/aos.css';
import AOS from 'aos';

export const Footer = () => {

  useEffect(() => {
    AOS.init({ offset: 100, duration: 500, easing: 'ease-in-out' });
    AOS.refresh();
  }, []);

  return (
    <div id='contact' className='w-full flex flex-col justify-center items-center'>
{/* 
<div data-aos='zoom-in' data-aos-delay='100'
        className='w-full bg-secondary lg:px-20 px-10 py-8 grid lg:grid-cols-6 grid-cols-2 justify-center items-center gap-10'>
        <img src={client1} alt='client1' className='w-[130px] opacity-70 cursor-pointer hover:opacity-100'/>
        <img src={client2} alt='client2' className='w-[130px] opacity-70 cursor-pointer hover:opacity-100'/>
        <img src={client3} alt='client3' className='w-[130px] opacity-70 cursor-pointer hover:opacity-100'/>
        <img src={client4} alt='client4' className='w-[130px] opacity-70 cursor-pointer hover:opacity-100'/>
        <img src={client5} alt='client5' className='w-[130px] opacity-70 cursor-pointer hover:opacity-100'/>
        <img src={client6} alt='client6' className='w-[130px] opacity-70 cursor-pointer hover:opacity-100'/>
      </div>
*/}
      
     

      {/* main */}
      <div className='w-full lg:px-20 px-5 py-[60px] bg-gray-100 grid lg:grid-cols-[2fr_1fr_1fr] grid-cols-1 items-start lg:gap-10 gap-10'>

        <div data-aos='zoom-in' data-aos-delay='200' className='flex flex-col items-start gap-6'>
          <div className='flex flex-col items-start'>
            <h1 className='text-3xl font-bold text-secondary italic tracking-tight'>DrewShop</h1>
            <p className='text-gray-500 mt-3 leading-relaxed text-sm'>
              Store built and maintained by <span className='font-semibold text-secondary'>Andrew González</span>,
              Software Engineer.<br/> Full-stack e-commerce project with Auth0, React, Node and MongoDB.
            </p>
          </div>
                {/*  <div className='flex flex-col items-start gap-3'>
            <h2 className='text-sm font-semibold text-gray-800 uppercase tracking-wide'>Available on</h2>
            <div className='flex items-center gap-3'>
              <img src={google} alt='google' className='h-10 object-contain'/>
              <img src={apple} alt='apple' className='h-10 object-contain'/>
            </div>
          </div> */}
         
        </div>

        <div data-aos='zoom-in' data-aos-delay='100'>
          <h2 className='text-sm font-semibold text-gray-800 uppercase tracking-wide'>About me</h2>
          <ul className='mt-5 flex flex-col items-start gap-3 text-gray-600 text-sm'>
            <li className='flex items-center gap-2'>
              <FaCode className='text-secondary'/> Software Engineer
            </li>
            <li className='flex items-center gap-2 text-gray-500'>
              Full-stack web developer
            </li>
            <li className='flex items-center gap-2 text-gray-500'>
              Auth0 ·React · Node · MongoDB
            </li>
            <li className='flex items-center gap-2 text-gray-500'>
              San José, Costa Rica
            </li>
          </ul>
        </div>

        <div data-aos='zoom-in' data-aos-delay='100'>
          <h2 className='text-sm font-semibold text-gray-800 uppercase tracking-wide'>Connect with me</h2>
          <ul className='mt-5 flex flex-col items-start gap-3'>
            <li>
              <a href='https://www.linkedin.com/' target='_blank' rel='noreferrer'
                className='flex items-center gap-3 text-gray-600 hover:text-secondary transition'>
                <FaLinkedin className='text-xl text-[#0A66C2]'/>
                <span className='text-sm font-medium'>LinkedIn</span>
              </a>
            </li>
            <li>
              <a href='https://www.instagram.com/' target='_blank' rel='noreferrer'
                className='flex items-center gap-3 text-gray-600 hover:text-secondary transition'>
                <FaInstagram className='text-xl text-pink-500'/>
                <span className='text-sm font-medium'>Instagram</span>
              </a>
            </li>
            <li>
              <a href='mailto:thorpeandrewgon@gmail.com'
                className='flex items-center gap-3 text-gray-600 hover:text-secondary transition text-sm font-medium'>
                thorpeandrewgon@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* bottom bar */}
      <div className='w-full lg:px-20 px-5 py-[40px] bg-gray-100'>
        <hr className='border-t border-gray-300 py-3'/>
        <div className='w-full flex lg:flex-row flex-col justify-between items-center lg:gap-4 gap-6'>
          {/* payment methods */}
          
          <div className=' w-full flex justify-center  items-center'>
            <p className='text-gray-500 text-center lg:text-end'>© 2026 Andrew González — Software Engineer</p>
          </div>
        </div>
      </div>

      {/* scroll to top */}
      <div id='icon-box'
        className='bg-secondary text-white p-3 rounded-full hover:bg-primary hover:text-black cursor-pointer fixed right-6 bottom-6 lg:bottom-6'>
        <Link to='hero' spy={true} offset={-100} smooth={true}>
          <FaArrowUp className='w-[35px] h-[35px]'/>
        </Link>
      </div>
    </div>
  )
}
export default Footer;
