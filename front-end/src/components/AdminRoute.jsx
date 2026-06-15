import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { API_URL } from '../utils/api';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fetchRole = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/users/byAuth0/${user.sub}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setRole(data.role);
      } catch (err) {
        setRole('user');
      } finally {
        setChecking(false);
      }
    };

    fetchRole();
  }, [isAuthenticated, user]);
  

  if (isLoading || checking) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
          <p className='text-gray-500 text-sm font-medium'>Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to='/' replace />;
  }

  return children;
};

export default AdminRoute;