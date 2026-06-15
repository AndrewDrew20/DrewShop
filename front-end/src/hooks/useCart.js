import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const useCart = () => {
  const { user } = useAuth0();
  const cartKey = user ? `cart_${user.sub}` : 'cart_guest';

  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem(cartKey) || '[]');
  });

  // Re-cargar cuando cambia el usuario
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(cartKey) || '[]');
    setCart(stored);
  }, [cartKey]);

  // Mantener sincronizado entre componentes / pestañas que disparen 'storage'.
  // Sin esto, el badge del Header no se entera cuando addToCart corre desde
  // otra instancia del hook (Products, ProductDetail, Wishlist).
  useEffect(() => {
    const onStorage = () => {
      setCart(JSON.parse(localStorage.getItem(cartKey) || '[]'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [cartKey]);

  const syncCart = (updated) => {
    setCart(updated);
    localStorage.setItem(cartKey, JSON.stringify(updated));
    // Dispara evento para que el header actualice el contador
    window.dispatchEvent(new Event('storage'));
  };

  const addToCart = (product, qty = 1) => {
    const existing = cart.find(i => i._id === product._id);
    if (existing) {
      syncCart(cart.map(i =>
        i._id === product._id
          ? { ...i, qty: Math.min(i.stock, i.qty + qty) }
          : i
      ));
    } else {
      syncCart([...cart, { ...product, qty }]);
    }
  };

  const removeFromCart = (id) => {
    syncCart(cart.filter(i => i._id !== id));
  };

  const changeQty = (id, delta) => {
    syncCart(cart.map(i =>
      i._id === id
        ? { ...i, qty: Math.max(1, Math.min(i.stock, i.qty + delta)) }
        : i
    ));
  };

  const clearCart = () => syncCart([]);

  const cartCount = cart.reduce((a, i) => a + i.qty, 0);
  const subtotal  = cart.reduce((a, i) => a + i.price * i.qty, 0);

  return { cart, cartKey, addToCart, removeFromCart, changeQty, clearCart, cartCount, subtotal };
};