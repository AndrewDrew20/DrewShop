import React, { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  FaSearch, FaClipboardList, FaMapMarkerAlt, FaUser, FaBoxOpen, FaTimes,
  FaPhone, FaEnvelope, FaIdBadge, FaCalendarAlt
} from 'react-icons/fa';
import Toast from './Toast';
import { useToast } from '../../hooks/useToast';
import { formatPrice } from '../../utils/format';
import { API_URL } from '../../utils/api';

const PURCHASES = `${API_URL}/purchases`;
const USERS     = `${API_URL}/users`;
const PRODUCTS  = `${API_URL}/products`;

const STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'];

const statusStyle = (s) => {
  switch (s) {
    case 'pending':   return 'bg-orange-50 text-orange-500';
    case 'shipped':   return 'bg-blue-50 text-blue-500';
    case 'delivered': return 'bg-green-50 text-green-600';
    case 'cancelled': return 'bg-red-50 text-red-500';
    default:          return 'bg-gray-100 text-gray-600';
  }
};

export default function AdminOrders() {
  const { getAccessTokenSilently } = useAuth0();
  const { toast, showToast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [users, setUsers]         = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating]   = useState(null);
  const [detail, setDetail]       = useState(null);

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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const auth  = { headers: { Authorization: `Bearer ${token}` } };
      const [pu, us, pr] = await Promise.all([
        fetch(PURCHASES, auth).then(r => r.json()),
        fetch(USERS, auth).then(r => r.json()),
        fetch(PRODUCTS).then(r => r.json()),
      ]);
      setPurchases(pu);
      setUsers(us);
      setProducts(pr);
    } catch {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const userByAuth0 = useMemo(() => {
    const map = {};
    users.forEach(u => { map[u.auth0Id] = u; });
    return map;
  }, [users]);

  const productById = useMemo(() => {
    const map = {};
    products.forEach(p => { map[p._id] = p; });
    return map;
  }, [products]);

  const changeStatus = async (purchase, newStatus) => {
    if (purchase.status === newStatus) return;
    setUpdating(purchase._id);
    try {
      const res = await authFetch(`${PURCHASES}/${purchase._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      showToast(`Status updated to "${newStatus}" ✓`);
      fetchAll();
      if (detail && detail._id === purchase._id) {
        setDetail({ ...detail, status: newStatus });
      }
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = purchases
    .slice()
    .reverse()
    .filter(p => {
      const buyer   = userByAuth0[p.id_User];
      const product = productById[p.id_Product];
      const matchSearch =
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        buyer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        buyer?.email?.toLowerCase().includes(search.toLowerCase()) ||
        product?.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter ? p.status === statusFilter : true;
      return matchSearch && matchStatus;
    });

  return (
    <div className='py-6 lg:py-10 px-4 sm:px-6 lg:px-10'>
      <Toast toast={toast}/>

      <div className='mb-6 lg:mb-8'>
        <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>Orders</h1>
        <p className='text-gray-400 text-sm mt-1'>{purchases.length} total order{purchases.length === 1 ? '' : 's'}</p>
      </div>

      <div className='flex flex-wrap items-center gap-3 mb-6'>
        <div className='relative flex-1 min-w-[200px] max-w-sm'>
          <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'/>
          <input
            type='text'
            placeholder='Search by product, buyer or email...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className='px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
        >
          <option value=''>All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
        {loading ? (
          <div className='flex justify-center py-20'>
            <div className='w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
            <FaClipboardList className='text-5xl mb-3'/>
            <p className='text-sm'>No orders</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-100'>
                <tr>
                  {['Product', 'Buyer', 'Shipping', 'Qty', 'Total', 'Status', 'Change'].map(h => (
                    <th key={h} className='text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {filtered.map(p => {
                  const buyer   = userByAuth0[p.id_User];
                  const product = productById[p.id_Product];
                  return (
                    <tr key={p._id}
                        onClick={() => setDetail(p)}
                        className='hover:bg-gray-50 transition-colors cursor-pointer'>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          {product?.imageUrl
                            ? <img src={product.imageUrl} alt={product.name} className='w-10 h-10 rounded-lg object-cover border border-gray-100'/>
                            : <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'><FaBoxOpen className='text-gray-300'/></div>
                          }
                          <p className='font-semibold text-gray-800 truncate max-w-[200px]'>
                            {product?.name || p.description}
                          </p>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {buyer ? (
                          <div>
                            <p className='font-semibold text-gray-700'>{p.fullName || buyer.name}</p>
                            <p className='text-xs text-gray-400'>{buyer.email}</p>
                            {p.phone && <p className='text-xs text-gray-400'>{p.phone}</p>}
                          </div>
                        ) : <span className='text-xs text-gray-400'>Unknown user</span>}
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-xs text-gray-600 max-w-[200px] line-clamp-2'>
                          {p.shippingAddress || <span className='text-gray-300'>—</span>}
                        </p>
                      </td>
                      <td className='px-6 py-4 text-gray-600'>x{p.quantity}</td>
                      <td className='px-6 py-4 font-semibold text-secondary'>{formatPrice(p.totalPrice)}</td>
                      <td className='px-6 py-4'>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyle(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className='px-6 py-4' onClick={e => e.stopPropagation()}>
                        <select
                          value={p.status}
                          onChange={e => changeStatus(p, e.target.value)}
                          disabled={updating === p._id}
                          className='px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-40'
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {detail && (() => {
        const buyer   = userByAuth0[detail.id_User];
        const product = productById[detail.id_Product];
        return (
          <div className='fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center px-6 py-5 border-b border-gray-100'>
                <h2 className='text-lg font-bold text-gray-800'>Order details</h2>
                <button onClick={() => setDetail(null)} className='text-gray-400 hover:text-gray-600'>
                  <FaTimes/>
                </button>
              </div>
              <div className='px-6 py-5 flex flex-col gap-5'>

                <div>
                  <p className='text-xs text-gray-400 uppercase font-semibold mb-2 flex items-center gap-2'><FaBoxOpen/> Product</p>
                  <div className='flex items-center gap-3'>
                    {product?.imageUrl
                      ? <img src={product.imageUrl} alt={product.name} className='w-14 h-14 rounded-lg object-cover border border-gray-100'/>
                      : <div className='w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center'><FaBoxOpen className='text-gray-300'/></div>
                    }
                    <div>
                      <p className='font-bold text-gray-800'>{product?.name || detail.description}</p>
                      <p className='text-xs text-gray-400'>Quantity: {detail.quantity}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className='text-xs text-gray-400 uppercase font-semibold mb-2 flex items-center gap-2'><FaUser/> Buyer</p>
                  <div className='text-sm bg-gray-50 rounded-xl p-4 flex flex-col gap-2'>
                    {detail.fullName && (
                      <div className='flex items-center gap-2'>
                        <FaIdBadge className='text-gray-400 text-xs'/>
                        <span className='font-semibold text-gray-800'>{detail.fullName}</span>
                        <span className='text-xs text-gray-400'>(order name)</span>
                      </div>
                    )}
                    {detail.phone && (
                      <div className='flex items-center gap-2'>
                        <FaPhone className='text-gray-400 text-xs'/>
                        <a href={`tel:${detail.phone}`} className='text-gray-700 hover:text-secondary'>{detail.phone}</a>
                      </div>
                    )}
                    {buyer ? (
                      <>
                        <div className='flex items-center gap-2'>
                          <FaUser className='text-gray-400 text-xs'/>
                          <span className='text-gray-700'>{buyer.name}</span>
                          <span className='text-xs text-gray-400'>(account)</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <FaEnvelope className='text-gray-400 text-xs'/>
                          <a href={`mailto:${buyer.email}`} className='text-gray-700 hover:text-secondary'>{buyer.email}</a>
                        </div>
                      </>
                    ) : (
                      <p className='text-xs text-gray-400'>Account not found (auth0Id: {detail.id_User})</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className='text-xs text-gray-400 uppercase font-semibold mb-2 flex items-center gap-2'><FaMapMarkerAlt/> Shipping address</p>
                  <p className='text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-line'>{detail.shippingAddress}</p>
                </div>

                {detail.date && (
                  <div>
                    <p className='text-xs text-gray-400 uppercase font-semibold mb-2 flex items-center gap-2'><FaCalendarAlt/> Order date</p>
                    <p className='text-sm text-gray-700'>{new Date(detail.date).toLocaleString()}</p>
                  </div>
                )}

                <div className='flex items-center justify-between border-t border-gray-100 pt-4'>
                  <div>
                    <p className='text-xs text-gray-400 uppercase font-semibold'>Total</p>
                    <p className='text-2xl font-bold text-secondary'>{formatPrice(detail.totalPrice)}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-gray-400 uppercase font-semibold mb-1'>Status</p>
                    <select
                      value={detail.status}
                      onChange={e => changeStatus(detail, e.target.value)}
                      disabled={updating === detail._id}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-secondary ${statusStyle(detail.status)}`}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
