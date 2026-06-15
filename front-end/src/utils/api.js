// Base URL del backend. Configurable por env:
//   - dev: .env.development → VITE_API_URL=http://localhost:3000
//   - prod: .env.production / Netlify → VITE_API_URL=https://ecommerce-desarrolloweb.onrender.com
// El fallback a localhost evita que un dev olvide setear el env y rompa todo.
// Sin barra al final: las rutas se concatenan tipo `${API_URL}/products`.
const raw = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_URL = raw.replace(/\/$/, '');
