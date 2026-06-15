import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  FaBoxOpen, FaDollarSign, FaTag, FaUsers, FaClipboardList, FaCoins
} from 'react-icons/fa';
import { MdInventory } from 'react-icons/md';
import { formatPrice } from '../../utils/format';
import { API_URL } from '../../utils/api';

const PRODUCTS   = `${API_URL}/products`;
const CATEGORIES = `${API_URL}/categories`;
const PURCHASES  = `${API_URL}/purchases`;
const USERS      = `${API_URL}/users`;

export default function AdminOverview() {
  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState({ products: [], categories: [], purchases: [], users: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getAccessTokenSilently();
        const auth = { headers: { Authorization: `Bearer ${token}` } };
        const [products, categories, purchases, users] = await Promise.all([
          fetch(PRODUCTS).then(r => r.json()),
          fetch(CATEGORIES).then(r => r.json()),
          fetch(PURCHASES, auth).then(r => r.json()),
          fetch(USERS, auth).then(r => r.json()),
        ]);
        setData({ products, categories, purchases, users });
      } catch (err) {
        console.error('Overview load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getAccessTokenSilently]);

  const totalStock = data.products.reduce((a, p) => a + (p.stock || 0), 0);
  const totalInventoryValue = data.products.reduce((a, p) => a + (p.price || 0) * (p.stock || 0), 0);
  const totalRevenue = data.purchases.reduce((a, pu) => a + (pu.totalPrice || 0), 0);
  const pendingOrders = data.purchases.filter(p => p.status === 'pending').length;

  const stats = [
    { label: 'Products',         value: data.products.length,             icon: <FaBoxOpen/>,       color: 'text-blue-500',    bg: 'bg-blue-50' },
    { label: 'Total stock',      value: totalStock,                        icon: <MdInventory/>,     color: 'text-green-500',   bg: 'bg-green-50' },
    { label: 'Inventory value',  value: formatPrice(totalInventoryValue),  icon: <FaDollarSign/>,    color: 'text-yellow-500',  bg: 'bg-yellow-50' },
    { label: 'Categories',       value: data.categories.length,            icon: <FaTag/>,           color: 'text-purple-500',  bg: 'bg-purple-50' },
    { label: 'Users',            value: data.users.length,                 icon: <FaUsers/>,         color: 'text-indigo-500',  bg: 'bg-indigo-50' },
    { label: 'Total orders',     value: data.purchases.length,             icon: <FaClipboardList/>, color: 'text-pink-500',    bg: 'bg-pink-50' },
    { label: 'Pending orders',   value: pendingOrders,                     icon: <FaClipboardList/>, color: 'text-orange-500',  bg: 'bg-orange-50' },
    { label: 'Total revenue',    value: formatPrice(totalRevenue),         icon: <FaCoins/>,         color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className='py-6 lg:py-10 px-4 sm:px-6 lg:px-10'>
      <div className='mb-6 lg:mb-8'>
        <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>Overview</h1>
        <p className='text-gray-400 text-sm mt-1'>Store status at a glance</p>
      </div>

      {loading ? (
        <div className='flex justify-center py-20'>
          <div className='w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8'>
            {stats.map((s, i) => (
              <div key={i} className='bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4'>
                <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center text-xl`}>
                  {s.icon}
                </div>
                <div className='min-w-0'>
                  <p className='text-xs text-gray-400 uppercase font-semibold tracking-wide'>{s.label}</p>
                  <p className='text-xl font-bold text-gray-800 truncate'>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='bg-white rounded-2xl shadow-sm p-6'>
              <h2 className='font-bold text-gray-800 mb-4'>Latest orders</h2>
              {data.purchases.length === 0 ? (
                <p className='text-sm text-gray-400'>No orders yet.</p>
              ) : (
                <ul className='divide-y divide-gray-50'>
                  {data.purchases.slice(-5).reverse().map(p => (
                    <li key={p._id} className='py-3 flex justify-between items-center text-sm'>
                      <div className='min-w-0'>
                        <p className='font-semibold text-gray-700 truncate'>{p.description}</p>
                        <p className='text-xs text-gray-400'>x{p.quantity}</p>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold text-secondary'>{formatPrice(p.totalPrice)}</p>
                        <p className={`text-xs font-semibold capitalize
                          ${p.status === 'pending' ? 'text-orange-500' : p.status === 'delivered' ? 'text-green-500' : 'text-gray-400'}`}>
                          {p.status}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className='bg-white rounded-2xl shadow-sm p-6'>
              <h2 className='font-bold text-gray-800 mb-4'>Low stock</h2>
              {(() => {
                const low = data.products.filter(p => (p.stock || 0) < 5);
                if (low.length === 0) return <p className='text-sm text-gray-400'>All good ✓</p>;
                return (
                  <ul className='divide-y divide-gray-50'>
                    {low.slice(0, 6).map(p => (
                      <li key={p._id} className='py-3 flex justify-between items-center text-sm gap-3'>
                        <p className='font-semibold text-gray-700 truncate'>{p.name}</p>
                        <span className={`font-semibold shrink-0 ${p.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                          {p.stock} in stock
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
