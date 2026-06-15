import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaTag, FaSearch } from 'react-icons/fa';
import Toast from './Toast';
import { useToast } from '../../hooks/useToast';
import { API_URL } from '../../utils/api';

const API = `${API_URL}/categories`;
const PRODUCTS_API = `${API_URL}/products`;

const EMPTY = { name: '', description: '' };

export default function AdminCategories() {
  const { getAccessTokenSilently } = useAuth0();
  const { toast, showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modal, setModal]           = useState(false);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(EMPTY);
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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        fetch(API).then(r => r.json()),
        fetch(PRODUCTS_API).then(r => r.json()),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setForm(EMPTY); setSelected(null); setModal('create'); };
  const openEdit   = (c)  => { setForm({ name: c.name, description: c.description }); setSelected(c); setModal('edit'); };
  const closeModal = ()   => { setModal(false); setSelected(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = modal === 'edit';
      const url    = isEdit ? `${API}/${selected._id}` : API;
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await authFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error');
      }
      showToast(isEdit ? 'Category updated ✓' : 'Category created ✓');
      fetchAll();
      closeModal();
    } catch (err) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await authFetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Category deleted ✓');
      fetchAll();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const countProducts = (id) => products.filter(p => p.id_category === id).length;

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='py-6 lg:py-10 px-4 sm:px-6 lg:px-10'>
      <Toast toast={toast}/>

      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8'>
        <div>
          <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>Categories</h1>
          <p className='text-gray-400 text-sm mt-1'>Organize your catalog</p>
        </div>
        <button onClick={openCreate}
          className='flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition font-semibold shadow-md w-full sm:w-auto justify-center'>
          <FaPlus className='text-xs'/> New category
        </button>
      </div>

      <div className='relative mb-6 max-w-sm'>
        <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'/>
        <input
          type='text'
          placeholder='Search category...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
        />
      </div>

      {loading ? (
        <div className='flex justify-center py-20'>
          <div className='w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
        </div>
      ) : filtered.length === 0 ? (
        <div className='bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 text-gray-400'>
          <FaTag className='text-5xl mb-3'/>
          <p className='text-sm'>No categories</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
          {filtered.map(c => (
            <div key={c._id} className='bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-3'>
              <div className='flex items-start justify-between gap-3'>
                <div className='w-10 h-10 rounded-xl bg-secondary bg-opacity-10 text-secondary flex items-center justify-center'>
                  <FaTag/>
                </div>
                <div className='flex gap-2'>
                  <button onClick={() => openEdit(c)} className='p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition'>
                    <FaEdit className='text-xs'/>
                  </button>
                  <button onClick={() => setDeleteId(c._id)} className='p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition'>
                    <FaTrash className='text-xs'/>
                  </button>
                </div>
              </div>
              <div>
                <h3 className='font-bold text-gray-800'>{c.name}</h3>
                <p className='text-sm text-gray-500 mt-1 line-clamp-2'>{c.description}</p>
              </div>
              <div className='text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100'>
                {countProducts(c._id)} product{countProducts(c._id) === 1 ? '' : 's'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className='fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md'>
            <div className='flex justify-between items-center px-6 py-5 border-b border-gray-100'>
              <h2 className='text-lg font-bold text-gray-800'>
                {modal === 'create' ? 'New category' : 'Edit category'}
              </h2>
              <button onClick={closeModal} className='text-gray-400 hover:text-gray-600'>
                <FaTimes/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className='px-6 py-5 flex flex-col gap-4'>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Name *</label>
                <input required value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
                  placeholder='e.g. Laptops'/>
              </div>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Description *</label>
                <textarea required value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  rows={3}
                  className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none'
                  placeholder='Category description...'/>
              </div>
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

      {deleteId && (
        <div className='fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center'>
            <div className='w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <FaTrash className='text-red-500 text-xl'/>
            </div>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>Delete category?</h3>
            <p className='text-gray-400 text-sm mb-6'>
              Associated products will become uncategorized.
            </p>
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
