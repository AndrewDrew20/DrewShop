import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  FaChartLine, FaBoxOpen, FaTag, FaUsers, FaClipboardList, FaBars, FaTimes
} from 'react-icons/fa';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';

const SECTIONS = [
  { id: 'overview',   label: 'Overview',   icon: <FaChartLine/>,     component: AdminOverview },
  { id: 'products',   label: 'Products',   icon: <FaBoxOpen/>,       component: AdminProducts },
  { id: 'categories', label: 'Categories', icon: <FaTag/>,           component: AdminCategories },
  { id: 'users',      label: 'Users',      icon: <FaUsers/>,         component: AdminUsers },
  { id: 'orders',     label: 'Orders',     icon: <FaClipboardList/>, component: AdminOrders },
];

export default function AdminLayout() {
  const { user } = useAuth0();
  const [active, setActive] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  const Active = SECTIONS.find(s => s.id === active)?.component || AdminOverview;
  const activeLabel = SECTIONS.find(s => s.id === active)?.label || 'Overview';

  const pickSection = (id) => {
    setActive(id);
    setMobileOpen(false);
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col lg:flex-row'>

      {/* Mobile top bar */}
      <div className='lg:hidden flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30'>
        <div>
          <h1 className='text-lg font-bold text-gray-800'>DrewShop</h1>
          <p className='text-xs text-gray-400 -mt-0.5'>{activeLabel}</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className='p-2 rounded-lg text-gray-600 hover:bg-gray-50'
          aria-label='Open menu'
        >
          <FaBars/>
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black bg-opacity-40 z-40'
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (desktop fixed, mobile drawer) */}
      <aside
        className={`
          bg-white border-r border-gray-100 flex flex-col
          fixed lg:sticky top-0 h-screen z-50
          w-64 transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        <div className='px-6 py-6 border-b border-gray-100 flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-bold text-gray-800'>DrewShop</h1>
            <p className='text-xs text-gray-400 mt-0.5'>Admin panel</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className='lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50'
            aria-label='Close menu'
          >
            <FaTimes/>
          </button>
        </div>

        <nav className='flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto'>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => pickSection(s.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left
                ${active === s.id
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className='text-base'>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <div className='px-3 py-4 border-t border-gray-100'>
          <div className='px-3 py-2'>
            <p className='text-xs text-gray-400'>Signed in as</p>
            <p className='text-sm font-semibold text-gray-700 truncate'>{user?.name || user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className='flex-1 overflow-x-hidden min-w-0'>
        <Active/>
      </main>
    </div>
  );
}
