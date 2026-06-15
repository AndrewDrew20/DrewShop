import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { API_URL } from '../utils/api';

export const useCategories = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {  // 👈 nombre diferente a 'fetch'
      try {
        const token = isAuthenticated ? await getAccessTokenSilently() : null;
        const res   = await fetch(`${API_URL}/categories`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();  // 👈 llamá a fetchCategories, no a fetch
  }, [isAuthenticated]);

  return { categories, loading };
};