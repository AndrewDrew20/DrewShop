import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FaSearch, FaUsers, FaUserShield, FaUser } from 'react-icons/fa';
import Toast from './Toast';
import { useToast } from '../../hooks/useToast';
import { API_URL } from '../../utils/api';

const API = `${API_URL}/users`;

export default function AdminUsers() {
  const { getAccessTokenSilently, user: me } = useAuth0();
  const { toast, showToast } = useToast();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [updating, setUpdating] = useState(null);

  const authFetch = async (url, options = {}) => {
    const token = await getAccessTokenSilently();
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await authFetch(API);
      const data = await res.json();
      setUsers(data);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (u, newRole) => {
    if (u.role === newRole) return;
    setUpdating(u._id);
    try {
      const res = await authFetch(`${API}/${u._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      showToast(`Role updated to ${newRole} ✓`);
      fetchUsers();
    } catch {
      showToast('Failed to update role', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className='py-6 lg:py-10 px-4 sm:px-6 lg:px-10'>
      <Toast toast={toast}/>

      <div className='mb-6 lg:mb-8'>
        <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>Users</h1>
        <p className='text-gray-400 text-sm mt-1'>
          {users.length} user{users.length === 1 ? '' : 's'} — {adminCount} admin{adminCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className='relative mb-6 max-w-sm'>
        <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'/>
        <input
          type='text'
          placeholder='Search by name, email or role...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
        />
      </div>

      <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
        {loading ? (
          <div className='flex justify-center py-20'>
            <div className='w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
            <FaUsers className='text-5xl mb-3'/>
            <p className='text-sm'>No users</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-100'>
                <tr>
                  {['User', 'Email', 'Joined', 'Role', 'Change role'].map(h => (
                    <th key={h} className='text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {filtered.map(u => {
                  const isMe = u.auth0Id === me?.sub;
                  return (
                    <tr key={u._id} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center
                            ${u.role === 'admin' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {u.role === 'admin' ? <FaUserShield/> : <FaUser/>}
                          </div>
                          <div>
                            <p className='font-semibold text-gray-800 flex items-center gap-2'>
                              {u.name}
                              {u.role === 'admin' && (
                                <span className='inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full'>
                                  <FaUserShield className='text-[9px]'/> admin
                                </span>
                              )}
                              {isMe && <span className='text-xs text-gray-400 font-normal'>(you)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-gray-600'>{u.email}</td>
                      <td className='px-6 py-4 text-gray-400 text-xs'>
                        {u.dateOfCreation ? new Date(u.dateOfCreation).toLocaleDateString() : '—'}
                      </td>
                      <td className='px-6 py-4'>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full
                          ${u.role === 'admin' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <select
                          value={u.role}
                          onChange={e => changeRole(u, e.target.value)}
                          disabled={isMe || updating === u._id}
                          className='px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-40 disabled:cursor-not-allowed'
                        >
                          <option value='user'>user</option>
                          <option value='admin'>admin</option>
                        </select>
                        {isMe && <p className='text-xs text-gray-400 mt-1'>You can&apos;t change your own role</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
