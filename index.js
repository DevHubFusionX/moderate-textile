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
const Combo = require('./models/Combo');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'moderate_ustaz_secret_key_2024';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fanyanwu83:2gzYARFKvDE8DBvR@cluster0.nvozb5i.mongodb.net/moderate_ustaz?retryWrites=true&w=majority&appName=Cluster0';

console.log('Attempting to connect to MongoDB...');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('MongoDB connected successfully');
    seedProducts();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Server running without database connection');
  });

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

app.use(cors({
  origin: ['https://moderate-textile.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Moderate Textile API is running',
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Admin user (in production, store in database)
const adminUser = {
  email: process.env.ADMIN_EMAIL || 'admin@moderateustaz.com',
  password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10)
};
// fixed

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
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, skipping seeding');
      return;
    }
    const count = await Product.countDocuments();
    if (count === 0) {
      const initialProducts = [
        {
          name: "Premium Cotton Kaftan",
          price: "₦18,000",
          category: "Traditional",
          description: "Elegant traditional kaftan made from premium cotton fabric. Perfect for formal occasions and daily wear.",
          fabricType: "100% Cotton",
          texture: "Smooth and breathable",
          quality: "Premium",
          care: "Machine wash cold, hang dry",
          image: "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/kaftan1",
          images: [
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/kaftan1",
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/kaftan2"
          ]
        },
        {
          name: "Embroidered Agbada Set",
          price: "₦35,000",
          category: "Premium",
          description: "Luxurious hand-embroidered Agbada with matching cap and trousers. Crafted for special occasions.",
          fabricType: "Silk blend",
          texture: "Smooth with intricate embroidery",
          quality: "Luxury",
          care: "Dry clean only",
          image: "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/agbada1",
          images: [
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/agbada1",
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/agbada2"
          ]
        },
        {
          name: "Ankara Print Fabric",
          price: "₦8,500",
          category: "Fabrics",
          description: "Vibrant Ankara print fabric, 6 yards. High-quality wax print perfect for traditional and modern designs.",
          fabricType: "Cotton wax print",
          texture: "Smooth with vibrant colors",
          quality: "Standard",
          care: "Machine wash warm, iron on medium heat",
          image: "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/ankara1",
          images: [
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/ankara1",
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/ankara2"
          ]
        },
        {
          name: "Traditional Cap (Fila)",
          price: "₦6,500",
          category: "Accessories",
          description: "Handwoven traditional cap available in multiple colors. Perfect complement to traditional wear.",
          fabricType: "Cotton blend",
          texture: "Woven with traditional patterns",
          quality: "Standard",
          care: "Hand wash gently, air dry",
          image: "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/cap1",
          images: [
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/cap1",
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/cap2"
          ]
        },
        {
          name: "Casual Jalabiya",
          price: "₦15,000",
          category: "Casual",
          description: "Comfortable daily wear jalabiya in soft cotton. Ideal for prayers and casual outings.",
          fabricType: "Cotton",
          texture: "Soft and comfortable",
          quality: "Standard",
          care: "Machine wash cold, tumble dry low",
          image: "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/jalabiya1",
          images: [
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/jalabiya1",
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/jalabiya2"
          ]
        },
        {
          name: "Senator Suit Set",
          price: "₦28,000",
          category: "Traditional",
          description: "Complete 3-piece senator suit with embroidered details. Includes top, trousers, and cap.",
          fabricType: "Cotton blend",
          texture: "Smooth with embroidered accents",
          quality: "Premium",
          care: "Dry clean recommended",
          image: "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/senator1",
          images: [
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/senator1",
            "https://res.cloudinary.com/dyfi4enfl/image/upload/v1/moderate_ustaz_products/senator2"
          ]
        }
      ];
      await Product.insertMany(initialProducts);
      console.log('Initial products seeded with detailed information');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

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
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product (public)
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add new product (protected)
app.post('/api/admin/products', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const { name, price, category, description, fabricType, texture, quality, care } = req.body;
    
    const images = req.files && req.files.length > 0 
      ? req.files.map(file => file.path)
      : ['https://via.placeholder.com/400x400'];
    
    const cloudinaryIds = req.files && req.files.length > 0
      ? req.files.map(file => file.public_id)
      : [];
    
    const newProduct = new Product({
      name,
      price,
      category,
      description,
      fabricType,
      texture,
      quality,
      care,
      image: images[0],
      images,
      cloudinaryId: cloudinaryIds[0] || null,
      cloudinaryIds
    });
    
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (protected)
app.put('/api/admin/products/:id', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, fabricType, texture, quality, care } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let updateData = {
      name: name || product.name,
      price: price || product.price,
      category: category || product.category,
      description: description || product.description,
      fabricType: fabricType || product.fabricType,
      texture: texture || product.texture,
      quality: quality || product.quality,
      care: care || product.care
    };
    
    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images from cloudinary
      if (product.cloudinaryIds && product.cloudinaryIds.length > 0) {
        for (const id of product.cloudinaryIds) {
          await cloudinary.uploader.destroy(id);
        }
      }
      
      const newImages = req.files.map(file => file.path);
      const newCloudinaryIds = req.files.map(file => file.public_id);
      
      updateData.image = newImages[0];
      updateData.images = newImages;
      updateData.cloudinaryId = newCloudinaryIds[0];
      updateData.cloudinaryIds = newCloudinaryIds;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
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
    
    // Delete all images from cloudinary (ignore errors)
    try {
      if (product.cloudinaryIds && product.cloudinaryIds.length > 0) {
        for (const cloudinaryId of product.cloudinaryIds) {
          if (cloudinaryId) {
            await cloudinary.uploader.destroy(cloudinaryId);
          }
        }
      } else if (product.cloudinaryId) {
        await cloudinary.uploader.destroy(product.cloudinaryId);
      }
    } catch (cloudinaryError) {
      console.log('Cloudinary deletion error (ignored):', cloudinaryError);
    }
    
    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get all combos (public)
app.get('/api/combos', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const combos = await Combo.find().populate('products').sort({ createdAt: -1 });
    res.json(combos);
  } catch (error) {
    console.error('Error fetching combos:', error);
    res.status(500).json({ error: 'Failed to fetch combos' });
  }
});

// Add new combo (protected)
app.post('/api/admin/combos', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, description, products, originalPrice, comboPrice, savings, popular } = req.body;
    const newCombo = new Combo({
      name,
      description,
      products: JSON.parse(products),
      originalPrice,
      comboPrice,
      savings,
      image: req.file ? req.file.path : 'https://via.placeholder.com/400x400',
      cloudinaryId: req.file ? req.file.public_id : null,
      popular: popular === 'true'
    });
    
    const savedCombo = await newCombo.save();
    const populatedCombo = await Combo.findById(savedCombo._id).populate('products');
    res.json(populatedCombo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create combo' });
  }
});

// Update combo (protected)
app.put('/api/admin/combos/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, products, originalPrice, comboPrice, savings, popular } = req.body;
    
    const combo = await Combo.findById(id);
    if (!combo) {
      return res.status(404).json({ error: 'Combo not found' });
    }
    
    if (req.file && combo.cloudinaryId) {
      await cloudinary.uploader.destroy(combo.cloudinaryId);
    }
    
    const updatedCombo = await Combo.findByIdAndUpdate(
      id,
      {
        name: name || combo.name,
        description: description || combo.description,
        products: products ? JSON.parse(products) : combo.products,
        originalPrice: originalPrice || combo.originalPrice,
        comboPrice: comboPrice || combo.comboPrice,
        savings: savings || combo.savings,
        image: req.file ? req.file.path : combo.image,
        cloudinaryId: req.file ? req.file.public_id : combo.cloudinaryId,
        popular: popular !== undefined ? popular === 'true' : combo.popular
      },
      { new: true }
    ).populate('products');
    
    res.json(updatedCombo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update combo' });
  }
});

// Delete combo (protected)
app.delete('/api/admin/combos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await Combo.findById(id);
    
    if (!combo) {
      return res.status(404).json({ error: 'Combo not found' });
    }
    
    if (combo.cloudinaryId) {
      await cloudinary.uploader.destroy(combo.cloudinaryId);
    }
    
    await Combo.findByIdAndDelete(id);
    res.json({ message: 'Combo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete combo' });
  }
});

// Change password
app.post('/api/admin/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const validPassword = await bcrypt.compare(currentPassword, adminUser.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  
  adminUser.password = bcrypt.hashSync(newPassword, 10);
  res.json({ message: 'Password changed successfully' });
});

// Change email
app.post('/api/admin/change-email', authenticateToken, async (req, res) => {
  const { currentPassword, newEmail } = req.body;
  
  const validPassword = await bcrypt.compare(currentPassword, adminUser.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  
  adminUser.email = newEmail;
  res.json({ message: 'Email changed successfully' });
});

// Verify token
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});