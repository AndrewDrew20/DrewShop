import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Banner from './components/Banner'
import Category from './components/Category'
import Hero from './components/Hero'
import Insta from './components/Insta'
import Reviews from './components/Reviews'
import Services from './components/Services'
import Types from './components/Types'
import Productsgrid from './components/Productsgrid'
import Auth0ProviderWithHistory from './components/auth0Provider'
import Profile from './components/profile'
import { Routes, Route } from 'react-router-dom'
import { useUserSync } from './hooks/useUserSync'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import Products from './components/Products'
import ProductDetail from './components/ProductDetail'
import Cart from './components/Cart'
import Wishlist from './components/Wishlist'
import ScrollToTop from './components/ScrollToTop'

const Home = () => (
  
  <>
    <Hero />
    <Category />
    <Types />
    <Productsgrid />
    <Banner />
    <Services />
    <Reviews />
    <Insta />
  </>
)

const AppContent = () => {
  useUserSync();
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path='/cart' element={<Cart />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/products' element={<Products />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        <Route path='/' element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/admin' element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }/>
      </Routes>
      <Footer />
    </>
  );
};

export default function App() {
  return (
    <Auth0ProviderWithHistory>
      <AppContent />
    </Auth0ProviderWithHistory>
  )
}