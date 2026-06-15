import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import {FaSearch, FaHeart, FaShoppingCart, FaMapMarkedAlt} from 'react-icons/fa'
import {IoPerson} from 'react-icons/io5'
import { Link, scroller } from 'react-scroll'
import {FaXmark, FaBars, FaPhoneVolume} from 'react-icons/fa6'
import {MdEmail} from 'react-icons/md'
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect, useRef, useState } from 'react';
import {useAuth0} from '@auth0/auth0-react';
import { useUserRole } from '../hooks/useUserRole'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'

export const Header = () => {
  const role = useUserRole();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    AOS.init({ offset: 100, duration: 500, easing: 'ease-in-out' });
    AOS.refresh();
  }, []);

  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu  = () => setIsMenuOpen(false);

  const toggleSearch = () => {
    setSearchOpen(prev => {
      const next = !prev;
      if (next) setTimeout(() => searchInputRef.current?.focus(), 50);
      return next;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setSearchOpen(false);
  };

  const menuItems = [
    { link: 'Home',         path: 'home' },
    { link: 'Testimonials', path: 'testimonials' },
    { link: 'Contact',      path: 'contact' },
  ];

  const handleNavClick = (path) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        scroller.scrollTo(path, { smooth: true, offset: -100, duration: 500 });
      }, 100);
    }
    closeMenu();
  };

  return (
    <>
    <div className='w-full px-16 py-2 bg-primary lg:flex hidden justify-between items-center gap-6'>
      <h1 className='text-sm font-semibold flex justify-center items-center gap-2'>
        <FaPhoneVolume className='size-[18px]'/><span>(+506) 8560-7197</span>
      </h1>
      <h1 className='text-sm font-semibold flex justify-center items-center gap-2'>
        <FaMapMarkedAlt className='size-[18px]'/><span>San José, Costa Rica</span>
      </h1>
      <h1 className='text-sm font-semibold flex justify-center items-center gap-2'>
        <MdEmail className='size-[18px]'/><span>thorpeandrewgon@gmail.com</span>
      </h1>
    </div>

    <nav className='w-full bg-white border-b border-gray-100 flex justify-between items-center lg:px-16 px-6 py-5 sticky top-0 z-50'>
      <h1
        className='text-secondary font-bold lg:text-[30px] text-3xl italic cursor-pointer tracking-tight'
        onClick={() => handleNavClick('home')}
      >
        DrewShop
      </h1>

      {/* Desktop menu */}
      <ul className='lg:flex justify-center items-center gap-10 hidden'>
        {menuItems.map((item, i) => (
          location.pathname === '/' ? (
            <Link key={i}
              className='text-gray-800 text-sm uppercase font-semibold cursor-pointer px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition'
              to={item.path} spy={true} offset={-100} smooth={true}>
              {item.link}
            </Link>
          ) : (
            <button key={i}
              className='text-gray-800 text-sm uppercase font-semibold cursor-pointer px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition'
              onClick={() => handleNavClick(item.path)}>
              {item.link}
            </button>
          )
        ))}

        <RouterLink
          className='text-gray-800 text-sm uppercase font-semibold cursor-pointer px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition'
          to='/products'
        >
          Products
        </RouterLink>

        {!isLoading && !isAuthenticated && (
          <button className='bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition'
            onClick={() => loginWithRedirect({ appState: { returnTo: location.pathname + location.search } })}>
            Log In
          </button>
        )}

        {!isLoading && isAuthenticated && (
          <>
            {role === 'admin' && (
              <RouterLink
                className='text-emerald-700 text-sm uppercase font-semibold cursor-pointer px-4 py-2 rounded-lg hover:bg-emerald-600 hover:text-white border border-emerald-300 transition'
                to='/admin'
              >
                Admin
              </RouterLink>
            )}

            <button
              className='bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition'
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Log Out
            </button>
          </>
        )}
      </ul>

      {/* Desktop icons */}
      <div id='header-icons' className='lg:flex hidden justify-center items-center gap-6 text-gray-700'>
        <button onClick={toggleSearch} aria-label='Search' className='cursor-pointer'>
          <FaSearch className='w-[20px] h-[20px] transform hover:scale-125 transition-transform duration-300 hover:text-secondary'/>
        </button>

        <RouterLink to='/profile' onClick={closeMenu}>
          <IoPerson className='w-[20px] h-[20px] transform hover:scale-125 transition-transform duration-300 cursor-pointer hover:text-secondary'/>
        </RouterLink>

        <div className='relative cursor-pointer' onClick={() => navigate('/wishlist')}>
          <FaHeart className='w-[20px] h-[20px] transform hover:scale-125 transition-transform duration-300 hover:text-rose-500'/>
          {wishlistCount > 0 && (
            <div className='bg-rose-500 text-white rounded-full absolute -top-[10px] -right-[10px] text-[11px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1'>
              {wishlistCount}
            </div>
          )}
        </div>

        <div className='relative cursor-pointer' onClick={() => navigate('/cart')}>
          <FaShoppingCart className='w-[20px] h-[20px] transform hover:scale-125 transition-transform duration-300 hover:text-secondary'/>
          {cartCount > 0 && (
            <div className='bg-secondary text-white rounded-full absolute -top-[10px] -right-[10px] text-[11px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1'>
              {cartCount}
            </div>
          )}
        </div>
      </div>

      {/* Mobile hamburger */}
      <div className='flex justify-center items-center lg:hidden mt-3' onClick={toggleMenu}>
        {isMenuOpen
          ? <FaXmark className='text-secondary text-3xl cursor-pointer'/>
          : <FaBars className='text-secondary text-3xl cursor-pointer'/>
        }
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'flex' : 'hidden'} w-full h-fit bg-secondary p-4 absolute top-[80px] left-0`}>
        <ul className='flex flex-col justify-center items-center gap-2 w-full'>
          {menuItems.map((item, i) => (
            location.pathname === '/' ? (
              <Link key={i}
                className='text-white uppercase font-semibold cursor-pointer p-3 rounded-lg hover:bg-white hover:text-secondary w-full text-center'
                to={item.path} spy={true} offset={-100} smooth={true} onClick={closeMenu}>
                {item.link}
              </Link>
            ) : (
              <button key={i}
                className='text-white uppercase font-semibold cursor-pointer p-3 rounded-lg hover:bg-white hover:text-secondary w-full text-center'
                onClick={() => handleNavClick(item.path)}>
                {item.link}
              </button>
            )
          ))}

          <RouterLink
            className='text-white uppercase font-semibold cursor-pointer p-3 rounded-lg hover:bg-white hover:text-secondary w-full text-center'
            to='/products' onClick={closeMenu}
          >
            Products
          </RouterLink>

          <RouterLink
            className='text-white uppercase font-semibold cursor-pointer p-3 rounded-lg hover:bg-white hover:text-secondary w-full text-center flex items-center justify-center gap-2'
            to='/wishlist' onClick={closeMenu}
          >
            <FaHeart/> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </RouterLink>

          <RouterLink
            className='text-white uppercase font-semibold cursor-pointer p-3 rounded-lg hover:bg-white hover:text-secondary w-full text-center flex items-center justify-center gap-2'
            to='/cart' onClick={closeMenu}
          >
            <FaShoppingCart/> Cart {cartCount > 0 && `(${cartCount})`}
          </RouterLink>

          {!isLoading && isAuthenticated && (
            <>
              {role === 'admin' && (
                <RouterLink
                  className='text-white uppercase font-semibold cursor-pointer p-3 rounded-lg hover:bg-white hover:text-secondary w-full text-center border border-white'
                  to='/admin' onClick={closeMenu}
                >
                  Admin
                </RouterLink>
              )}

              <button
                className='text-white uppercase font-semibold cursor-pointer p-3 rounded-lg hover:bg-white hover:text-secondary w-full text-center'
                onClick={() => { logout({ logoutParams: { returnTo: window.location.origin } }); closeMenu(); }}
              >
                Log Out
              </button>
            </>
          )}

          {!isLoading && !isAuthenticated && (
            <button
              className='text-white uppercase font-semibold cursor-pointer p-3 rounded-lg hover:bg-white hover:text-secondary w-full text-center'
              onClick={() => { loginWithRedirect({ appState: { returnTo: location.pathname + location.search } }); closeMenu(); }}
            >
              Log In
            </button>
          )}
        </ul>
      </div>
    </nav>

    {/* Search overlay */}
    {searchOpen && (
      <div className='w-full bg-white border-b border-gray-100 sticky top-[80px] z-40 px-6 lg:px-16 py-4 shadow-sm'>
        <form onSubmit={handleSearchSubmit} className='max-w-2xl mx-auto flex items-center gap-2'>
          <div className='relative flex-1'>
            <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'/>
            <input
              ref={searchInputRef}
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search products...'
              className='w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
            />
          </div>
          <button type='submit'
            className='bg-secondary text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition'>
            Search
          </button>
          <button type='button' onClick={() => setSearchOpen(false)}
            className='text-gray-400 hover:text-gray-600 p-2'>
            <FaXmark/>
          </button>
        </form>
      </div>
    )}
    </>
  );
};

export default Header;
