// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true // Index for faster name searches
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    index: true // Index for price range queries
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true // Index for category filtering
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    index: true // Index for brand filtering
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  countInStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true // Index for rating filtering
  },
  numReviews: {
    type: Number,
    default: 0,
    index: true // Index for popularity sorting
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true // Index for active products
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: Map,
    of: String
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
productSchema.index({ isActive: 1, category: 1 });
productSchema.index({ isActive: 1, brand: 1 });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ isActive: 1, rating: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, numReviews: -1 });

// Text index for full-text search
productSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  brand: 'text',
  tags: 'text'
}, {
  weights: {
    name: 10,
    brand: 8,
    category: 6,
    tags: 4,
    description: 2
  },
  name: 'product_text_index'
});

// Virtual for average rating calculation
productSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / this.reviews.length;
});

// Method to update rating and numReviews
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = sum / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);