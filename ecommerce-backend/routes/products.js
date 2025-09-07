const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Clean filename: remove whitespace, special characters, and normalize
    let cleanName = file.originalname
      .trim() // Remove leading/trailing whitespace
      .replace(/\s+/g, '_') // Replace all whitespace (spaces, tabs, newlines) with underscores
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters with underscores
      .replace(/_+/g, '_') // Replace multiple consecutive underscores with single underscore
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    
    // Ensure we have a valid filename
    if (!cleanName || cleanName === '') {
      cleanName = 'image';
    }
    
    // Get file extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Create final filename with timestamp
    const finalName = `${Date.now()}_${cleanName}${ext}`;
    
    console.log('Original filename:', file.originalname);
    console.log('Cleaned filename:', finalName);
    
    cb(null, finalName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      countInStock,
      rating = 0,
      numReviews = 0
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !brand || !countInStock) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, description, price, category, brand, countInStock' 
      });
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }

    // Validate countInStock
    const stockNum = parseInt(countInStock);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ message: 'Count in stock must be a valid non-negative number' });
    }

    // Create product object
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      category: category.trim(),
      brand: brand.trim(),
      countInStock: stockNum,
      rating: parseFloat(rating) || 0,
      numReviews: parseInt(numReviews) || 0,
      isActive: true
    };

    // Add image if uploaded
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
      console.log('Image uploaded:', req.file.filename);
      console.log('Image path:', productData.image);
    }

    // Create product
    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create product' 
    });
  }
});

// @desc    Get products with advanced filtering, searching, and sorting
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Text search
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Brand filter
    if (brand && brand !== 'all') {
      query.brand = brand;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Product.countDocuments(query);

    res.json({
      products,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
      hasPrevPage: pageNum > 1
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch products' 
    });
  }
});

// @desc    Get all products for admin (including inactive)
// @route   GET /api/products/admin
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      isActive,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    // Build query - admin can see all products including inactive ones
    let query = {};

    // Text search
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Brand filter
    if (brand && brand !== 'all') {
      query.brand = brand;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Product.countDocuments(query);

    res.json({
      products,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
      hasPrevPage: pageNum > 1
    });

  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch products' 
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch product' 
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      description,
      price,
      category,
      brand,
      countInStock,
      rating,
      numReviews,
      isActive
    } = req.body;

    // Update fields
    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (price) product.price = parseFloat(price);
    if (category) product.category = category.trim();
    if (brand) product.brand = brand.trim();
    if (countInStock !== undefined) product.countInStock = parseInt(countInStock);
    if (rating !== undefined) product.rating = parseFloat(rating);
    if (numReviews !== undefined) product.numReviews = parseInt(numReviews);
    if (isActive !== undefined) product.isActive = isActive;

    // Update image if new one uploaded
    if (req.file) {
      // Delete old image if exists
      if (product.image && product.image.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to update product' 
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete image file if exists
    if (product.image && product.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to delete product' 
    });
  }
});

// @desc    Get filter options
// @route   GET /api/products/filters/options
// @access  Public
router.get('/filters/options', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    const brands = await Product.distinct('brand', { isActive: true });
    
    // Get price range
    const priceStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.json({
      categories,
      brands,
      priceRange: priceStats[0] || { minPrice: 0, maxPrice: 1000 }
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch filter options' 
    });
  }
});

module.exports = router;