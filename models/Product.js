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
    enum: ['Traditional', 'Casual', 'Premium', 'Accessories']
  },
  image: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);