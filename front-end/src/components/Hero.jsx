import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import headset from '../FotosAshleyweb/banner3.jpg'
import earbuds from '../FotosAshleyweb/banner2.jpg'
import dslr from '../FotosAshleyweb/banner1.jpg'
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useCategories } from '../hooks/useCategories';

export const Hero = () => {
  const navigate = useNavigate();
  const { categories } = useCategories();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 500,
      easing: 'ease-in-out',
    });
    AOS.refresh();
  }, []);

  // Cada slide del hero apunta a una categoría real del DB por índice.
  // Si todavía no cargaron, o si no hay tantas categorías como slides,
  // caemos al catálogo completo en /products.
  const goToCollection = (slideIndex) => {
    const cat = categories?.[slideIndex];
    navigate(cat ? `/products?category=${encodeURIComponent(cat._id)}` : '/products');
  };

  const slides = [
    { bg: dslr,    discount: '15%', title: ['Traditional', 'Canvas'] },
    { bg: earbuds, discount: '30%', title: ['Digital',    'Illustrations'] },
    { bg: headset, discount: '40%', title: ['Other',      'Techniques'] },
  ];

  return (
    <div id="hero" className='w-full flex justify-center items-center lg:h-[700px] h-[500px] sm:h-[600px]'>
      <Slider className='w-full' {...settings}>
        {slides.map((s, i) => (
          <div key={i}>
            <div
              className='w-full lg:px-20 sm:px-10 px-5 lg:h-[700px] h-[500px] sm:h-[600px] flex flex-col justify-center items-start gap-4 sm:gap-6 lg:gap-10 bg-cover bg-center'
              style={{ backgroundImage: `url(${s.bg})` }}
            >
              <h1 data-aos="zoom-in" data-aos-delay="50"
                className='text-primary border rounded-lg border-primary px-3 py-1 sm:px-4 sm:py-1.5 lg:px-6 lg:py-2 text-sm sm:text-base lg:text-xl'>
                Get up to {s.discount} discount
              </h1>
              <h1 data-aos="zoom-in" data-aos-delay="100"
                className='text-white text-4xl sm:text-6xl lg:text-[120px] uppercase font-bold leading-tight sm:leading-[70px] lg:leading-[120px]'>
                {s.title[0]} <br />{s.title[1]}
              </h1>
              <h1 data-aos="zoom-in" data-aos-delay="100" className='text-white text-base sm:text-xl lg:text-2xl'>
                100% <span className='text-primary'>handmade</span>
              </h1>
              <button
                data-aos="zoom-in" data-aos-delay="200"
                onClick={() => goToCollection(i)}
                className='bg-primary px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-lg text-black text-sm sm:text-base font-semibold hover:bg-secondary hover:text-white transition'
              >
                COLLECTIONS
              </button>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default Hero;
