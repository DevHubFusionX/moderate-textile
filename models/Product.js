const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Traditional', 'Casual', 'Premium', 'Fabrics', 'Accessories']
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  colors: [{
    name: String,
    images: [String]
  }],
  fabricType: {
    type: String,
    trim: true
  },
  texture: {
    type: String,
    trim: true
  },
  quality: {
    type: String,
    trim: true
  },
  care: {
    type: String,
    trim: true
  },
  cloudinaryId: {
    type: String
  },
  cloudinaryIds: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);