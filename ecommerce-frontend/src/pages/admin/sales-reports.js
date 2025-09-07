// pages/admin/sales-reports.js
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { 
  getSalesOverview, 
  getSalesByPeriod, 
  getTopProducts, 
  getCustomerAnalytics, 
  getOrderStatusDistribution 
} from '../../services/reportService';
import ExportButton from '../../components/ExportButton';
import { formatPrice } from '../../utils/currency';

const SalesReports = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch sales overview
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['salesOverview', selectedPeriod],
    queryFn: () => getSalesOverview(selectedPeriod),
    enabled: isAuthenticated() && user?.role === 'admin',
    refetchOnWindowFocus: false,
  });

  // Fetch sales by period
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['salesByPeriod', selectedTimeframe, selectedPeriod],
    queryFn: () => getSalesByPeriod(selectedTimeframe, selectedPeriod),
    enabled: isAuthenticated() && user?.role === 'admin',
    refetchOnWindowFocus: false,
  });

  // Fetch top products
  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['topProducts', selectedPeriod],
    queryFn: () => getTopProducts(selectedPeriod, '10'),
    enabled: isAuthenticated() && user?.role === 'admin',
    refetchOnWindowFocus: false,
  });

  // Fetch customer analytics
  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['customerAnalytics', selectedPeriod],
    queryFn: () => getCustomerAnalytics(selectedPeriod),
    enabled: isAuthenticated() && user?.role === 'admin',
    refetchOnWindowFocus: false,
  });

  // Fetch order status distribution
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['orderStatus', selectedPeriod],
    queryFn: () => getOrderStatusDistribution(selectedPeriod),
    enabled: isAuthenticated() && user?.role === 'admin',
    refetchOnWindowFocus: false,
  });

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return '��';
    if (growth < 0) return '📉';
    return '➡️';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'sales', name: 'Sales Trends', icon: '📈' },
    { id: 'products', name: 'Top Products', icon: '🏆' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'orders', name: 'Order Status', icon: '📋' },
  ];

  // Show loading state
  if (overviewLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading sales reports...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (overviewError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-3xl shadow-xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-4">{overviewError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAuthenticated() || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-3xl shadow-xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sales Reports</h1>
            <p className="text-gray-600 text-lg">Comprehensive analytics and insights for your business</p>
          </div>
          <ExportButton period={selectedPeriod} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Timeframe
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && overview && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold mt-1">{formatPrice(overview.current.revenue)}</p>
                        <div className={`flex items-center mt-2 ${getGrowthColor(overview.growth.revenue)}`}>
                          <span className="mr-1">{getGrowthIcon(overview.growth.revenue)}</span>
                          <span className="text-sm font-medium">{formatPercentage(overview.growth.revenue)}</span>
                        </div>
                      </div>
                      <div className="text-5xl opacity-20">💰</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Total Orders</p>
                        <p className="text-3xl font-bold mt-1">{formatNumber(overview.current.orders)}</p>
                        <div className={`flex items-center mt-2 ${getGrowthColor(overview.growth.orders)}`}>
                          <span className="mr-1">{getGrowthIcon(overview.growth.orders)}</span>
                          <span className="text-sm font-medium">{formatPercentage(overview.growth.orders)}</span>
                        </div>
                      </div>
                      <div className="text-5xl opacity-20">📦</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Avg Order Value</p>
                        <p className="text-3xl font-bold mt-1">{formatPrice(overview.current.avgOrderValue)}</p>
                      </div>
                      <div className="text-5xl opacity-20">🛒</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Period</p>
                        <p className="text-3xl font-bold mt-1">{overview.period} days</p>
                      </div>
                      <div className="text-5xl opacity-20">📅</div>
                    </div>
                  </div>
                </div>

                {/* Comparison with Previous Period */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Period Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="font-semibold text-gray-700 mb-4 text-lg">Current Period</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-bold text-lg text-gray-900">{formatPrice(overview.current.revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Orders:</span>
                          <span className="font-bold text-lg text-gray-900">{formatNumber(overview.current.orders)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="font-semibold text-gray-700 mb-4 text-lg">Previous Period</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-bold text-lg text-gray-900">{formatPrice(overview.previous.revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Orders:</span>
                          <span className="font-bold text-lg text-gray-900">{formatNumber(overview.previous.orders)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sales Trends Tab */}
            {activeTab === 'sales' && salesData && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Sales Trends - {selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)}</h3>
                
                {salesData.data && salesData.data.length > 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="space-y-4">
                      {salesData.data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">
                              {selectedTimeframe === 'daily' && `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`}
                              {selectedTimeframe === 'weekly' && `${item._id.year} Week ${item._id.week}`}
                              {selectedTimeframe === 'monthly' && `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`}
                            </p>
                            <p className="text-gray-500">{formatNumber(item.orders)} orders</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{formatPrice(item.revenue)}</p>
                            <p className="text-gray-500">Avg: {formatPrice(item.avgOrderValue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-6">📊</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sales Data</h3>
                    <p className="text-gray-500">No sales data available for the selected period</p>
                  </div>
                )}
              </div>
            )}

            {/* Top Products Tab */}
            {activeTab === 'products' && topProducts && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Top Products - Last {topProducts.period} days</h3>
                
                {topProducts.products && topProducts.products.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.products.map((product, index) => (
                      <div key={product.productId} className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                              {product.productImage ? (
                                <img 
                                  src={product.productImage} 
                                  alt={product.productName}
                                  className="w-16 h-16 object-cover rounded-xl"
                                />
                              ) : (
                                <span className="text-3xl">📦</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{product.productName}</p>
                            <p className="text-gray-500">
                              {formatNumber(product.totalQuantity)} sold • {formatNumber(product.orderCount)} orders
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{formatPrice(product.totalRevenue)}</p>
                          <p className="text-gray-500">Avg: {formatPrice(product.avgPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-6">🏆</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Product Sales</h3>
                    <p className="text-gray-500">No product sales data available</p>
                  </div>
                )}
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && customerData && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">Customer Analytics - Last {customerData.period} days</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 font-semibold text-sm">Total Customers</p>
                        <p className="text-3xl font-bold text-blue-900 mt-1">{formatNumber(customerData.totalCustomers)}</p>
                      </div>
                      <div className="text-5xl text-blue-200">👥</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 font-semibold text-sm">New Customers</p>
                        <p className="text-3xl font-bold text-green-900 mt-1">{formatNumber(customerData.newCustomers)}</p>
                      </div>
                      <div className="text-5xl text-green-200">🆕</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 font-semibold text-sm">Active Customers</p>
                        <p className="text-3xl font-bold text-purple-900 mt-1">{formatNumber(customerData.activeCustomers)}</p>
                      </div>
                      <div className="text-5xl text-purple-200">⚡</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 font-semibold text-sm">Avg Orders/Customer</p>
                        <p className="text-3xl font-bold text-orange-900 mt-1">{customerData.analytics.avgOrdersPerCustomer.toFixed(1)}</p>
                      </div>
                      <div className="text-5xl text-orange-200">📊</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8">
                  <h4 className="font-bold text-gray-900 mb-6 text-xl">Customer Behavior</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <p className="text-gray-600 text-sm font-medium">Average Spent per Customer</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{formatPrice(customerData.analytics.avgSpentPerCustomer)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <p className="text-gray-600 text-sm font-medium">Average Order Value</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{formatPrice(customerData.analytics.avgOrderValue)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Status Tab */}
            {activeTab === 'orders' && statusData && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Order Status Distribution - Last {statusData.period} days</h3>
                
                {statusData.distribution && statusData.distribution.length > 0 ? (
                  <div className="space-y-4">
                    {statusData.distribution.map((status, index) => (
                      <div key={index} className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className={`w-6 h-6 rounded-full ${
                              status.status === 'Delivered' ? 'bg-green-500' :
                              status.status === 'Paid' ? 'bg-blue-500' :
                              status.status === 'Pending' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></div>
                            <h4 className="text-xl font-bold text-gray-900">{status.status}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-gray-900">{formatNumber(status.count)}</p>
                            <p className="text-gray-500">orders</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Revenue:</span>
                          <span className="font-bold text-xl text-gray-900">{formatPrice(status.totalRevenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-6">📋</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Order Data</h3>
                    <p className="text-gray-500">No order status data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;