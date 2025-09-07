const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get sales overview
// @route   GET /api/reports/overview
// @access  Private/Admin
router.get('/overview', protect, admin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total revenue
    const revenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isCancelled: false
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Previous period comparison
    const prevStartDate = new Date();
    prevStartDate.setDate(prevStartDate.getDate() - (parseInt(period) * 2));
    const prevEndDate = new Date(startDate);

    const prevRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: prevStartDate, $lt: prevEndDate },
          isCancelled: false
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Average order value
    const avgOrderValue = revenueResult[0]?.totalRevenue / (revenueResult[0]?.totalOrders || 1);

    // Revenue growth
    const currentRevenue = revenueResult[0]?.totalRevenue || 0;
    const prevRevenue = prevRevenueResult[0]?.totalRevenue || 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Order growth
    const currentOrders = revenueResult[0]?.totalOrders || 0;
    const prevOrders = prevRevenueResult[0]?.totalOrders || 0;
    const orderGrowth = prevOrders > 0 ? ((currentOrders - prevOrders) / prevOrders) * 100 : 0;

    res.json({
      current: {
        revenue: currentRevenue,
        orders: currentOrders,
        avgOrderValue: avgOrderValue
      },
      previous: {
        revenue: prevRevenue,
        orders: prevOrders
      },
      growth: {
        revenue: revenueGrowth,
        orders: orderGrowth
      },
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Error fetching sales overview:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get sales by period (daily, weekly, monthly)
// @route   GET /api/reports/sales-by-period
// @access  Private/Admin
router.get('/sales-by-period', protect, admin, async (req, res) => {
  try {
    const { period = 'daily', days = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let groupFormat;
    let dateFormat;

    switch (period) {
      case 'daily':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupFormat = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        dateFormat = '%Y-W%U';
        break;
      case 'monthly':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        dateFormat = '%Y-%m';
        break;
      default:
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        dateFormat = '%Y-%m-%d';
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isCancelled: false
        }
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalPrice' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
      }
    ]);

    res.json({
      period,
      data: salesData,
      dateFormat
    });
  } catch (error) {
    console.error('Error fetching sales by period:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get top products
// @route   GET /api/reports/top-products
// @access  Private/Admin
router.get('/top-products', protect, admin, async (req, res) => {
  try {
    const { period = '30', limit = '10' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isCancelled: false
        }
      },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalQuantity: { $sum: '$orderItems.qty' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          productImage: '$product.image',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          avgPrice: { $divide: ['$totalRevenue', '$totalQuantity'] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      period: parseInt(period),
      products: topProducts
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get customer analytics
// @route   GET /api/reports/customers
// @access  Private/Admin
router.get('/customers', protect, admin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'user' });

    // New customers in period
    const newCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startDate }
    });

    // Active customers (made at least one order)
    const activeCustomers = await Order.distinct('user', {
      createdAt: { $gte: startDate },
      isCancelled: false
    });

    // Customer analytics
    const customerAnalytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isCancelled: false
        }
      },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          avgOrderValue: { $avg: '$totalPrice' }
        }
      },
      {
        $group: {
          _id: null,
          avgOrdersPerCustomer: { $avg: '$totalOrders' },
          avgSpentPerCustomer: { $avg: '$totalSpent' },
          avgOrderValue: { $avg: '$avgOrderValue' }
        }
      }
    ]);

    res.json({
      totalCustomers,
      newCustomers,
      activeCustomers: activeCustomers.length,
      analytics: customerAnalytics[0] || {
        avgOrdersPerCustomer: 0,
        avgSpentPerCustomer: 0,
        avgOrderValue: 0
      },
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get order status distribution
// @route   GET /api/reports/order-status
// @access  Private/Admin
router.get('/order-status', protect, admin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const statusDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            isPaid: '$isPaid',
            isDelivered: '$isDelivered',
            isCancelled: '$isCancelled'
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $project: {
          status: {
            $cond: {
              if: '$isCancelled',
              then: 'Cancelled',
              else: {
                $cond: {
                  if: '$isDelivered',
                  then: 'Delivered',
                  else: {
                    $cond: {
                      if: '$isPaid',
                      then: 'Paid',
                      else: 'Pending'
                    }
                  }
                }
              }
            }
          },
          count: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json({
      period: parseInt(period),
      distribution: statusDistribution
    });
  } catch (error) {
    console.error('Error fetching order status distribution:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Export sales report
// @route   GET /api/reports/export
// @access  Private/Admin
router.get('/export', protect, admin, async (req, res) => {
  try {
    const { format = 'json', period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get detailed sales data
    const orders = await Order.find({
      createdAt: { $gte: startDate }
    })
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });

    if (format === 'json') {
      res.json({
        period: parseInt(period),
        startDate,
        endDate: new Date(),
        totalOrders: orders.length,
        orders: orders
      });
    } else {
      // For CSV or other formats, you would implement the conversion here
      res.status(400).json({ message: 'Only JSON format supported currently' });
    }
  } catch (error) {
    console.error('Error exporting sales report:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
