// backend/routes/cart.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.items.product');
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // Handle both old format (productId, quantity) and new format (full product object with _id, qty)
    let productId, quantity, name, price, image;
    
    if (req.body._id && req.body.qty) {
      // New format: full product object
      productId = req.body._id;
      quantity = req.body.qty;
      name = req.body.name;
      price = req.body.price;
      image = req.body.image;
    } else {
      // Old format: separate fields
      productId = req.body.productId;
      quantity = req.body.quantity;
      name = req.body.name;
      price = req.body.price;
      image = req.body.image;
    }
    
    if (!productId || !quantity) {
      return res.status(400).json({ 
        message: 'Product ID and quantity are required' 
      });
    }
    
    const user = await User.findById(req.user._id);
    const existingItem = user.cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.items.push({
        product: productId,
        quantity,
        name,
        price,
        image
      });
    }

    // Recalculate totals
    user.cart.totalPrice = user.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    user.cart.totalItems = user.cart.items.reduce((total, item) => total + item.quantity, 0);

    await user.save();
    await user.populate('cart.items.product');
    
    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: user.cart
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to add item to cart' 
    });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
router.put('/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    const cartItem = user.cart.items.id(req.params.itemId);

    if (cartItem) {
      cartItem.quantity = quantity;
      
      user.cart.totalPrice = user.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      user.cart.totalItems = user.cart.items.reduce((total, item) => total + item.quantity, 0);

      await user.save();
      await user.populate('cart.items.product');
      
      res.json({
        success: true,
        message: 'Cart updated successfully',
        cart: user.cart
      });
    } else {
      res.status(404).json({ message: 'Cart item not found' });
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to update cart item' 
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart.items = user.cart.items.filter(item => item._id.toString() !== req.params.itemId);
    
    user.cart.totalPrice = user.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    user.cart.totalItems = user.cart.items.reduce((total, item) => total + item.quantity, 0);

    await user.save();
    await user.populate('cart.items.product');
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: user.cart
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to remove cart item' 
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = { items: [], totalPrice: 0, totalItems: 0 };
    await user.save();
    
    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: user.cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to clear cart' 
    });
  }
});

module.exports = router;