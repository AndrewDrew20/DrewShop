import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const useWishlist = () => {
  const { user } = useAuth0();
  const key = user ? `wishlist_${user.sub}` : 'wishlist_guest';

  const [items, setItems] = useState(() => {
    return JSON.parse(localStorage.getItem(key) || '[]');
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    setItems(stored);
  }, [key]);

  // Mantener sincronizado entre pestañas / componentes que disparen 'storage'
  useEffect(() => {
    const onStorage = () => {
      setItems(JSON.parse(localStorage.getItem(key) || '[]'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  const sync = (updated) => {
    setItems(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const toggle = (product) => {
    const exists = items.some(i => i._id === product._id);
    if (exists) {
      sync(items.filter(i => i._id !== product._id));
    } else {
      sync([...items, product]);
    }
  };

  const remove = (id) => sync(items.filter(i => i._id !== id));
  const clear  = () => sync([]);
  const has    = (id) => items.some(i => i._id === id);

  return { wishlist: items, wishlistCount: items.length, toggle, remove, clear, has };
};
