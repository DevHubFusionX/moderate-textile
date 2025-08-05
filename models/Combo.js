const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
  originalPrice: {
    type: String,
    required: true
  },
  comboPrice: {
    type: String,
    required: true
  },
  savings: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  cloudinaryIds: [{
    type: String
  }],
  popular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Combo', comboSchema);