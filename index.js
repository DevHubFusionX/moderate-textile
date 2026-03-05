require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedProducts = require('./utils/seeder');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const comboRoutes = require('./routes/comboRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Keep-alive service for free tier
if (process.env.NODE_ENV === 'production') {
  require('./keepAlive');
}

// Connect to Database
connectDB().then((conn) => {
  if (conn) {
    seedProducts();
  }
});

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['https://moderate-textile.vercel.app', 'http://localhost:3000', 'http://localhost:5173', 'https://www.moderatestextile.com'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));
app.use(express.json());

// Health check endpoints
app.get('/', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    message: 'Moderate Textile API is running',
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/admin', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/products', productRoutes); // For backward compatibility with some frontend calls if needed
app.use('/api/combos', comboRoutes);
app.use('/api/admin/combos', comboRoutes); // For backward compatibility

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});