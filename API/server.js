require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const User = require('./models/userModel');
const { auth } = require('express-oauth2-jwt-bearer');

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB', err));

app.use(express.json());

const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Sin origin = curl, server-to-server, etc.
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  }
}));

// Middleware JWT 
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,   
  issuerBaseURL: process.env.ISSUER_BASE_URL, 
   tokenSigningAlg: 'HS256', 
   secret: process.env.SECRET
});

//anadir o actualizar usuario en DB al loguearse
app.post('/users/sync', checkJwt, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { name, email } = req.body;

  try {
    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = new User({ auth0Id, name, email, role: 'user' });
      await user.save();
      console.log('New user created:', user);
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//optener usuario por auth0Id
app.get('/users/byAuth0/:auth0Id', checkJwt, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.auth0Id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Health check (Render + cron de keep-alive lo usan)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ecommerce-api',
    endpoints: ['/products', '/categories', '/purchases', '/users', '/roles'],
  });
});

// Rutas
const userRouter     = require('./routes/users');
const productRouter  = require('./routes/products');
const purchaseRouter = require('./routes/purchase');
const categoryRouter = require('./routes/category');
const rolRouter      = require('./routes/role');

app.use('/users',     checkJwt, userRouter);
app.use('/products', productRouter);
app.use('/purchases', purchaseRouter);
app.use('/categories', categoryRouter);
app.use('/roles',      rolRouter);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));