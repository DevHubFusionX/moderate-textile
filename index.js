require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('./models/Product');

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'moderate_ustaz_secret_key_2024';

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'moderate_ustaz_products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// Admin user (in production, store in database)
const adminUser = {
  email: 'admin@moderateustaz.com',
  password: bcrypt.hashSync('admin123', 10)
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Seed initial products if database is empty
const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const initialProducts = [
        { name: "3-Piece Senator", price: "₦15,000", category: "Traditional", image: "https://via.placeholder.com/400x400" },
        { name: "Traditional Kaftan", price: "₦12,000", category: "Traditional", image: "https://via.placeholder.com/400x400" },
        { name: "Embroidered Cap", price: "₦5,000", category: "Accessories", image: "https://via.placeholder.com/400x400" },
        { name: "Premium Agbada", price: "₦25,000", category: "Traditional", image: "https://via.placeholder.com/400x400" },
        { name: "Daily Jalabiya", price: "₦18,000", category: "Casual", image: "https://via.placeholder.com/400x400" },
        { name: "Designer Kaftan", price: "₦20,000", category: "Premium", image: "https://via.placeholder.com/400x400" }
      ];
      await Product.insertMany(initialProducts);
      console.log('Initial products seeded');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

seedProducts();

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email !== adminUser.email) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const validPassword = await bcrypt.compare(password, adminUser.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ email: adminUser.email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, message: 'Login successful' });
});

// Get all products (public)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add new product (protected)
app.post('/api/admin/products', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const newProduct = new Product({
      name,
      price,
      category,
      image: req.file ? req.file.path : 'https://via.placeholder.com/400x400',
      cloudinaryId: req.file ? req.file.public_id : null
    });
    
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (protected)
app.put('/api/admin/products/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete old image from cloudinary if new image is uploaded
    if (req.file && product.cloudinaryId) {
      await cloudinary.uploader.destroy(product.cloudinaryId);
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name || product.name,
        price: price || product.price,
        category: category || product.category,
        image: req.file ? req.file.path : product.image,
        cloudinaryId: req.file ? req.file.public_id : product.cloudinaryId
      },
      { new: true }
    );
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (protected)
app.delete('/api/admin/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete image from cloudinary
    if (product.cloudinaryId) {
      await cloudinary.uploader.destroy(product.cloudinaryId);
    }
    
    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Verify token
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});