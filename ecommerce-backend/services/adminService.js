// backend/services/adminService.js
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments({ isActive: true });
  const totalOrders = await Order.countDocuments();
  
  const orders = await Order.find();
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  
  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
  };
};

const getUsers = async () => {
  return await User.find().select('-password');
};

const updateUser = async (userId, userData) => {
  return await User.findByIdAndUpdate(
    userId,
    userData,
    { new: true }
  ).select('-password');
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
};