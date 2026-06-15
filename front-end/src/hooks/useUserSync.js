// src/hooks/useUserSync.js
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { API_URL } from '../utils/api';

export const useUserSync = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const sync = async () => {
      try {
        const token = await getAccessTokenSilently();

        await fetch(`${API_URL}/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
          }),
        });
      } catch (err) {
        console.error('Error syncing user:', err);
      }
    };

    sync();
  }, [getAccessTokenSilently, isAuthenticated, user]);
};