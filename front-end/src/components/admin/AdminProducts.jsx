import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBoxOpen,
  FaStar, FaImage, FaCubes
} from 'react-icons/fa';
import { useCategories } from '../../hooks/useCategories';
import Toast from './Toast';
import { useToast } from '../../hooks/useToast';
import { formatPrice } from '../../utils/format';
import { API_URL } from '../../utils/api';

const API = `${API_URL}/products`;

const EMPTY_FORM = {
  name: '', id_category: '', id_User: '',
  description: '', price: '', stock: '',
  imageUrl: '',
};

export default function AdminProducts() {
  const { categories } = useCategories();
  const { user, getAccessTokenSilently } = useAuth0();
  const { toast, showToast } = useToast();
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal, setModal]           = useState(false);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState(null);

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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res  = await fetch(API);
      const data = await res.json();
      setProducts(data);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, id_User: user?.sub || '' });
    setSelected(null);
    setModal('create');
  };

  const openEdit = (product) => {
    setForm({
      name:        product.name        ?? '',
      id_category: product.id_category ?? '',
      id_User:     product.id_User     ?? '',
      description: product.description ?? '',
      price:       product.price       ?? '',
      stock:       product.stock       ?? '',
      imageUrl:    product.imageUrl    ?? '',
    });
    setSelected(product);
    setModal('edit');
  };

  const closeModal = () => { setModal(false); setSelected(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = modal === 'edit';
      const url    = isEdit ? `${API}/${selected._id}` : API;
      const method = isEdit ? 'PATCH' : 'POST';

      const body = {
        name: form.name,
        id_category: form.id_category,
        id_User: form.id_User,
        description: form.description,
        price:  Number(form.price),
        stock:  Number(form.stock),
        imageUrl: form.imageUrl,
      };

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      showToast(isEdit ? 'Product updated ✓' : 'Product created ✓');
      fetchProducts();
      closeModal();
    } catch {
      showToast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await authFetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Product deleted ✓');
      fetchProducts();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter ? p.id_category === categoryFilter : true;
    return matchSearch && matchCategory;
  });

  return (
    <div className='py-6 lg:py-10 px-4 sm:px-6 lg:px-10'>
      <Toast toast={toast}/>

      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8'>
        <div>
          <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>Products</h1>
          <p className='text-gray-400 text-sm mt-1'>Catalog management</p>
        </div>
        <button
          onClick={openCreate}
          className='flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition font-semibold shadow-md w-full sm:w-auto justify-center'
        >
          <FaPlus className='text-xs'/> New product
        </button>
      </div>

      {/* Filtros */}
      <div className='flex flex-wrap items-center gap-3 mb-6'>
        <div className='relative flex-1 min-w-[200px] max-w-sm'>
          <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'/>
          <input
            type='text'
            placeholder='Search by name...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className='px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
        >
          <option value=''>All categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        {(search || categoryFilter) && (
          <button
            onClick={() => { setSearch(''); setCategoryFilter(''); }}
            className='text-sm text-red-500 hover:text-red-600 font-semibold flex items-center gap-1'
          >
            <FaTimes className='text-xs'/> Clear
          </button>
        )}
        <span className='sm:ml-auto text-sm text-gray-400'>
          {filtered.length} of {products.length}
        </span>
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <div className='w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
            <FaBoxOpen className='text-5xl mb-3'/>
            <p className='text-sm'>No products</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-100'>
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map(h => (
                    <th key={h} className='text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {filtered.map(p => (
                  <tr key={p._id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className='w-10 h-10 rounded-lg object-cover border border-gray-100'/>
                          : <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'><FaImage className='text-gray-300'/></div>
                        }
                        <div>
                          <p className='font-semibold text-gray-800'>{p.name}</p>
                          <p className='text-xs text-gray-400 truncate max-w-[180px]'>{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='bg-secondary bg-opacity-10 text-secondary text-xs font-semibold px-3 py-1 rounded-full'>
                        {categories.find(c => c._id === p.id_category)?.name || p.id_category}
                      </span>
                    </td>
                    <td className='px-6 py-4 font-semibold text-gray-800'>{formatPrice(p.price)}</td>
                    <td className='px-6 py-4'>
                      <span className={`font-semibold ${p.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      {p.rating > 0
                        ? <span className='flex items-center gap-1 text-yellow-500 font-semibold'>
                            <FaStar className='text-xs'/>{p.rating}
                            <span className='text-xs text-gray-400 font-normal ml-1'>({p.reviews?.length || 0})</span>
                          </span>
                        : <span className='text-gray-300'>no reviews</span>
                      }
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <button onClick={() => openEdit(p)}
                          className='p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition'>
                          <FaEdit/>
                        </button>
                        <button onClick={() => setDeleteId(p._id)}
                          className='p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition'>
                          <FaTrash/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {modal && (
        <div className='fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center px-6 py-5 border-b border-gray-100'>
              <h2 className='text-lg font-bold text-gray-800'>
                {modal === 'create' ? 'New product' : 'Edit product'}
              </h2>
              <button onClick={closeModal} className='text-gray-400 hover:text-gray-600 transition'>
                <FaTimes/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className='px-6 py-5 flex flex-col gap-4'>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
                  placeholder='e.g. MacBook Pro 14"'/>
              </div>

              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Category *</label>
                <select required value={form.id_category}
                  onChange={e => setForm({...form, id_category: e.target.value})}
                  className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white'>
                  <option value=''>Pick a category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Description *</label>
                <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={3}
                  className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none'
                  placeholder='Product description...'/>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Price *</label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>₡</span>
                    <input required type='number' min='0' step='1' value={form.price}
                      onChange={e => setForm({...form, price: e.target.value})}
                      className='w-full border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
                      placeholder='0'/>
                  </div>
                </div>
                <div>
                  <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Stock *</label>
                  <div className='relative'>
                    <FaCubes className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'/>
                    <input required type='number' min='0' value={form.stock}
                      onChange={e => setForm({...form, stock: e.target.value})}
                      className='w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
                      placeholder='0'/>
                  </div>
                </div>
              </div>

              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Image URL</label>
                <div className='relative'>
                  <FaImage className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'/>
                  <input type='url' value={form.imageUrl}
                    onChange={e => setForm({...form, imageUrl: e.target.value})}
                    className='w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
                    placeholder='https://...'/>
                </div>
              </div>

              <p className='text-xs text-gray-400 -mt-1'>
                Rating is calculated automatically from user reviews.
              </p>

              <div className='flex justify-end gap-3 pt-2'>
                <button type='button' onClick={closeModal}
                  className='px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition'>
                  Cancel
                </button>
                <button type='submit' disabled={saving}
                  className='px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-opacity-90 transition disabled:opacity-50 flex items-center gap-2'>
                  {saving && <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'/>}
                  {modal === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar delete */}
      {deleteId && (
        <div className='fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center'>
            <div className='w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <FaTrash className='text-red-500 text-xl'/>
            </div>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>Delete product?</h3>
            <p className='text-gray-400 text-sm mb-6'>This action cannot be undone.</p>
            <div className='flex gap-3 justify-center'>
              <button onClick={() => setDeleteId(null)}
                className='px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition'>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className='px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition'>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
