const crc = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '₡0';
  return crc.format(n);
};
