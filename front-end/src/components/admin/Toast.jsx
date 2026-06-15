import React from 'react';

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold
      ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
      {toast.msg}
    </div>
  );
}
