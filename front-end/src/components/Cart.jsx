import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaMapMarkerAlt, FaLock } from 'react-icons/fa';
import { MdShoppingBag } from 'react-icons/md';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format';
import { API_URL } from '../utils/api';

const PURCHASES_API = `${API_URL}/purchases`;
const PRODUCTS_API  = `${API_URL}/products`;

export default function Cart() {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();
  const { cart, removeFromCart, changeQty, clearCart, subtotal } = useCart();

  const [address, setAddress]         = useState('');
  const [fullName, setFullName]       = useState('');
  const [phone, setPhone]             = useState('');
  const [placing, setPlacing]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const FREE_SHIPPING_THRESHOLD = 50000;
  const SHIPPING_COST = 2500;
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total    = subtotal + shipping;

  const handleCheckout = async () => {
  if (!fullName.trim() || !phone.trim() || !address.trim()) {
    showToast('Please fill in name, phone and address', 'error');
    return;
  }
  if (cart.length === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }

  setPlacing(true);
  try {
    const token = await getAccessTokenSilently();
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 1) Reservar stock atómicamente para cada item. El endpoint hace
    //    findOneAndUpdate condicional, así dos compradores simultáneos no
    //    pueden llevarse la misma última unidad.
    const stockResults = await Promise.all(
      cart.map(item =>
        fetch(`${PRODUCTS_API}/${item._id}/decrement-stock`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ qty: item.qty }),
        }).then(async r => ({ ok: r.ok, item, body: await r.json().catch(() => ({})) }))
      )
    );

    const failed = stockResults.find(r => !r.ok);
    if (failed) {
      throw new Error(failed.body.message
        ? `${failed.item.name}: ${failed.body.message}`
        : `Insufficient stock for "${failed.item.name}"`);
    }

    // Crear los pedidos. El backend ignora id_User del body y lo fuerza
    //    desde el token, pero se manda igual por compatibilidad.
    const purchaseResults = await Promise.all(
      cart.map(item =>
        fetch(PURCHASES_API, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            id_Product:      item._id,
            id_Category:     item.id_category,
            id_User:         user.sub,
            quantity:        item.qty,
            totalPrice:      item.price * item.qty,
            status:          'pending',
            shippingAddress: address,
            fullName,
            phone,
            description:     item.name,
          }),
        })
      )
    );
    if (!purchaseResults.every(r => r.ok)) {
      throw new Error('Failed to create orders');
    }

    clearCart();
    setOrderPlaced(true);
  } catch (err) {
    showToast(err.message || 'Order processing failed', 'error');
  } finally {
    setPlacing(false);
  }
};

  // Confirmación 
  if (orderPlaced) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-6'>
        <div className='bg-white rounded-2xl shadow-md p-12 max-w-md w-full text-center'>
          <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <MdShoppingBag className='text-green-500 text-4xl'/>
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>Order confirmed!</h2>
          <p className='text-gray-400 text-sm mb-8'>
            Your order was placed successfully. It will arrive at{' '}
            <span className='font-semibold text-gray-600'>{address}</span>.
          </p>
          <div className='flex flex-col gap-3'>
            <button onClick={() => navigate('/products')}
              className='w-full bg-secondary text-white py-3 rounded-xl font-semibold hover:bg-opacity-90 transition'>
              Continue shopping
            </button>
            <button onClick={() => navigate('/')}
              className='w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition'>
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-6 lg:px-16'>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
        <div className='flex flex-col gap-3'>
          <button onClick={() => navigate('/products')}
            className='flex items-center gap-2 text-gray-500 hover:text-secondary transition text-sm font-semibold w-fit'>
            <FaArrowLeft className='text-xs'/> Continue shopping
          </button>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>My Cart</h1>
            <p className='text-gray-400 text-sm mt-1'>
              {cart.length === 0 ? 'Empty' : `${cart.reduce((a, i) => a + i.qty, 0)} item${cart.reduce((a, i) => a + i.qty, 0) === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
        {cart.length > 0 && (
          <button onClick={clearCart}
            className='flex items-center gap-2 text-red-400 hover:text-red-500 text-sm font-semibold transition w-fit'>
            <FaTrash className='text-xs'/> Clear
          </button>
        )}
      </div>

      {/* empty */}
      {cart.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-32 text-gray-400'>
          <FaShoppingCart className='text-6xl mb-4'/>
          <p className='text-lg font-semibold'>Your cart is empty</p>
          <p className='text-sm mt-1 mb-6'>Add products to continue</p>
          <button onClick={() => navigate('/products')}
            className='bg-secondary text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition'>
            Browse products
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

          {/* Items */}
          <div className='lg:col-span-2 flex flex-col gap-4'>
            {cart.map(item => (
              <div key={item._id} className='bg-white rounded-2xl shadow-sm p-4 sm:p-5'>
                <div className='flex gap-3 sm:gap-4 items-start sm:items-center'>
                  <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0'>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} className='w-full h-full object-cover'/>
                      : <div className='w-full h-full flex items-center justify-center text-3xl'>📦</div>
                    }
                  </div>

                  <div className='flex-1 min-w-0'>
                    <h3 className='font-bold text-gray-800 text-sm sm:text-base truncate'>{item.name}</h3>
                    <p className='text-xs text-gray-400 mt-0.5 truncate'>{item.id_category}</p>
                    <p className='text-secondary font-bold mt-1 text-sm sm:text-base'>{formatPrice(item.price)}</p>
                  </div>

                  <button onClick={() => removeFromCart(item._id)}
                    className='text-red-400 hover:text-red-500 transition shrink-0 sm:hidden'
                    aria-label='Remove'>
                    <FaTrash className='text-sm'/>
                  </button>

                  {/* Desktop right side */}
                  <div className='hidden sm:flex items-center gap-4'>
                    <div className='flex items-center border border-gray-200 rounded-xl overflow-hidden'>
                      <button onClick={() => changeQty(item._id, -1)}
                        className='px-3 py-2 text-gray-600 hover:bg-gray-50 transition font-bold'>−</button>
                      <span className='px-3 py-2 font-semibold text-gray-800 text-sm min-w-[32px] text-center'>
                        {item.qty}
                      </span>
                      <button onClick={() => changeQty(item._id, +1)}
                        className='px-3 py-2 text-gray-600 hover:bg-gray-50 transition font-bold'>+</button>
                    </div>

                    <div className='text-right shrink-0 min-w-[70px]'>
                      <p className='font-bold text-gray-800'>{formatPrice(item.price * item.qty)}</p>
                      <button onClick={() => removeFromCart(item._id)}
                        className='text-red-400 hover:text-red-500 transition mt-1'
                        aria-label='Remove'>
                        <FaTrash className='text-xs'/>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile bottom row: qty + subtotal */}
                <div className='sm:hidden flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
                  <div className='flex items-center border border-gray-200 rounded-xl overflow-hidden'>
                    <button onClick={() => changeQty(item._id, -1)}
                      className='px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition font-bold'>−</button>
                    <span className='px-3 py-1.5 font-semibold text-gray-800 text-sm min-w-[32px] text-center'>
                      {item.qty}
                    </span>
                    <button onClick={() => changeQty(item._id, +1)}
                      className='px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition font-bold'>+</button>
                  </div>
                  <p className='font-bold text-gray-800'>{formatPrice(item.price * item.qty)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className='flex flex-col gap-4'>
            <div className='bg-white rounded-2xl shadow-sm p-6'>
              <h2 className='font-bold text-gray-800 mb-4'>Order summary</h2>
              <div className='flex flex-col gap-3 text-sm'>
                <div className='flex justify-between text-gray-500'>
                  <span>Subtotal</span>
                  <span className='font-semibold text-gray-700'>{formatPrice(subtotal)}</span>
                </div>
                <div className='flex justify-between text-gray-500'>
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-500' : 'text-gray-700'}`}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className='text-xs text-gray-400'>Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
                )}
                <div className='border-t border-gray-100 pt-3 flex justify-between'>
                  <span className='font-bold text-gray-800'>Total</span>
                  <span className='font-bold text-secondary text-lg'>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4'>
              <h2 className='font-bold text-gray-800 flex items-center gap-2'>
                <FaMapMarkerAlt className='text-secondary text-sm'/> Shipping info
              </h2>

              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Full name</label>
                <input
                  type='text'
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder='e.g. John Doe'
                  className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
                />
              </div>

              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Phone</label>
                <input
                  type='tel'
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder='e.g. +506 8560-7197'
                  className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary'
                />
              </div>

              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'>Address</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={3}
                  placeholder='e.g. Av. Central, San José, Costa Rica'
                  className='w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none'
                />
              </div>
            </div>


            <button
              onClick={handleCheckout}
              disabled={placing || cart.length === 0}
              className='w-full flex items-center justify-center gap-2 bg-secondary text-white py-4 rounded-xl font-bold text-sm hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
            >
              {placing
                ? <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'/>
                : <><FaLock className='text-xs'/> Confirm order</>
              }
            </button>

            <p className='text-xs text-gray-400 text-center'>
              By confirming you accept our terms and conditions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}