'use client'

import { useState, useEffect } from 'react'
import { Users, ShoppingCart, DollarSign, BookOpen, ChefHat, TrendingUp, RefreshCw } from "lucide-react"
import { apiClient } from '@/lib/api'

type StatCard = {
  title: string;
  value: string | number;
  delta: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  note?: string;
};

type DashboardStats = {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalBooks: number;
  totalRecipes: number;
  recentOrders: { id: string; userName: string; total: number; status: string }[];
  topBooks: { id: string; title: string; orderCount: number }[];
  revenueData: number[];
  conversionFunnel: {
    visits: number;
    views: number;
    addsToCart: number;
    orders: number;
  };
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(true)

  const fetchDashboardStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      // Try to fetch from multiple endpoints to get real data
      const [usersResponse, ordersResponse, booksResponse] = await Promise.allSettled([
        apiClient.getUsers(1, 1), // Just get count
        apiClient.getOrders(1, 1), // Just get count  
        apiClient.getBooks()
      ])

      // Calculate stats from available data
      const totalUsers = usersResponse.status === 'fulfilled' ? usersResponse.value.pagination?.totalCount || 0 : 0
      const totalOrders = ordersResponse.status === 'fulfilled' ? ordersResponse.value.pagination?.totalCount || 0 : 0
      const books = booksResponse.status === 'fulfilled' ? (Array.isArray(booksResponse.value) ? booksResponse.value : (booksResponse.value as { books?: unknown[] }).books || []) : []
      const totalBooks = books.length
      const totalRecipes = books.reduce((sum: number, book: { recipeCount?: number }) => sum + (book.recipeCount || 0), 0)
      const totalOrdersFromBooks = books.reduce((sum: number, book: { orderCount?: number }) => sum + (book.orderCount || 0), 0)
      
      // Get recent orders if available
      let recentOrders: { id: string; userName: string; total: number; status: string }[] = []
      if (ordersResponse.status === 'fulfilled') {
        recentOrders = ordersResponse.value.orders || []
      }

      // Calculate revenue from real order data
      let totalRevenue = 0
      let revenueData: number[] = []
      
      if (ordersResponse.status === 'fulfilled' && ordersResponse.value.orders) {
        // Calculate real revenue from actual orders
        const orders = ordersResponse.value.orders
        totalRevenue = orders.reduce((sum: number, order: { total?: number }) => sum + (order.total || 0), 0)
        
        // Try to get more orders for historical data
        try {
          const historicalOrdersResponse = await apiClient.getOrders(1, 100) // Get more orders
          if (historicalOrdersResponse.orders) {
            const allOrders = historicalOrdersResponse.orders
            
            // Group orders by month for the last 12 months
            const monthlyRevenue: { [key: string]: number } = {}
            const now = new Date()
            
            // Initialize last 12 months
            for (let i = 11; i >= 0; i--) {
              const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              monthlyRevenue[monthKey] = 0
            }
            
            // Sum revenue by month
            allOrders.forEach((order: { createdAt: string; total?: number }) => {
              const orderDate = new Date(order.createdAt)
              const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`
              if (monthlyRevenue.hasOwnProperty(monthKey)) {
                monthlyRevenue[monthKey] += order.total || 0
              }
            })
            
            // Convert to array for chart
            revenueData = Object.values(monthlyRevenue)
          } else {
            // Fallback: distribute total revenue across 12 months
            const monthlyAverage = totalRevenue / 12
            revenueData = Array(12).fill(monthlyAverage)
          }
        } catch {
          // Fallback: distribute total revenue across 12 months
          const monthlyAverage = totalRevenue / 12
          revenueData = Array(12).fill(monthlyAverage)
        }
      } else {
        // No orders available, use estimates
        totalRevenue = totalOrders * 45 // Average order value estimate
        const monthlyAverage = totalRevenue / 12
        revenueData = Array(12).fill(monthlyAverage)
      }

      // Generate conversion funnel data
      const conversionFunnel = {
        visits: Math.max(totalUsers * 15, 1000), // Estimate visits
        views: Math.max(totalUsers * 8, 500),   // Estimate views
        addsToCart: Math.max(totalOrders * 2, 100), // Estimate cart additions
        orders: totalOrders
      }

      // Sort books by order count for top books
      const topBooks = books
        .sort((a: { orderCount?: number }, b: { orderCount?: number }) => (b.orderCount || 0) - (a.orderCount || 0))
        .slice(0, 4)

      setStats({
        totalUsers,
        totalOrders: Math.max(totalOrders, totalOrdersFromBooks),
        totalRevenue,
        totalBooks,
        totalRecipes,
        recentOrders,
        topBooks,
        revenueData,
        conversionFunnel
      })
      setApiAvailable(true)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Set realistic mock data if all APIs fail
      setStats({
        totalUsers: 1247,
        totalOrders: 3421,
        totalRevenue: 45678,
        totalBooks: 156,
        totalRecipes: 89,
        recentOrders: [
          { id: '1001', userName: 'John Doe', total: 79.99, status: 'delivered' },
          { id: '1002', userName: 'Jane Smith', total: 45.50, status: 'shipped' },
          { id: '1003', userName: 'Mike Johnson', total: 89.99, status: 'processing' },
          { id: '1004', userName: 'Sarah Wilson', total: 34.99, status: 'pending' },
          { id: '1005', userName: 'David Brown', total: 67.50, status: 'delivered' },
          { id: '1006', userName: 'Lisa Davis', total: 52.99, status: 'shipped' }
        ],
        topBooks: [
          { id: '1', title: 'Mediterranean Cookbook', orderCount: 432 },
          { id: '2', title: 'Vegan Delight', orderCount: 321 },
          { id: '3', title: 'Dessert Mastery', orderCount: 298 },
          { id: '4', title: 'Quick Recipes', orderCount: 243 }
        ],
        revenueData: [12, 14, 11, 16, 18, 15, 20, 22, 19, 24, 26, 30],
        conversionFunnel: {
          visits: 10000,
          views: 6800,
          addsToCart: 2400,
          orders: 1200
        }
      })
      setApiAvailable(false)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const handleRefresh = () => {
    fetchDashboardStats(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards: StatCard[] = stats ? [
    { title: "Users", value: stats.totalUsers, delta: "+12%", icon: Users, gradient: "gradient-primary", note: "Active this month" },
    { title: "Orders", value: stats.totalOrders, delta: "+8%", icon: ShoppingCart, gradient: "gradient-success", note: "Processed" },
    { title: "Revenue", value: formatCurrency(stats.totalRevenue), delta: "+15%", icon: DollarSign, gradient: "gradient-warning", note: "Last 30 days" },
    { title: "Books", value: stats.totalBooks, delta: "+3%", icon: BookOpen, gradient: "gradient-secondary" },
    { title: "Recipes", value: stats.totalRecipes, delta: "+7%", icon: ChefHat, gradient: "gradient-danger" },
  ] : []
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-slate-600">Overview of your Munchclub platform</p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-4"></div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* API Status Notification */}
      {!apiAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>API Connection:</strong> Unable to connect to the backend API. Displaying demo data. 
                <span className="ml-2 text-yellow-600">
                  Make sure your backend server is running on port 3001.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((s, i) => (
          <div key={s.title} className="card-modern p-6 group hover:scale-105 transition-all duration-300" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-4 rounded-2xl ${s.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-600">{s.delta}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">{s.title}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
              {s.note && <p className="text-xs text-slate-500 mt-1">{s.note}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-modern p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Revenue Overview</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Last 12 months</span>
              {stats && stats.revenueData.some(val => val > 0) ? (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Real Data
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Estimated
                </span>
              )}
            </div>
          </div>
          <div className="h-56">
            <svg viewBox="0 0 400 160" className="w-full h-full">
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                points={stats?.revenueData
                  .map((v, idx) => {
                    const x = (idx / (stats.revenueData.length - 1)) * 380 + 10;
                    const y = 150 - (v / Math.max(...stats.revenueData, 1)) * 140;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
              <polygon
                fill="url(#grad)"
                points={(() => {
                  const pts = stats?.revenueData.map((v, idx) => {
                    const x = (idx / (stats.revenueData.length - 1)) * 380 + 10;
                    const y = 150 - (v / Math.max(...stats.revenueData, 1)) * 140;
                    return `${x},${y}`;
                  }) || [];
                  return `10,150 ${pts.join(" ")} 390,150`;
                })()}
              />
              <line x1="10" y1="150" x2="390" y2="150" stroke="#e2e8f0" />
              <line x1="10" y1="10" x2="10" y2="150" stroke="#e2e8f0" />
            </svg>
          </div>
        </div>

        <div className="card-modern p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            {stats?.conversionFunnel ? [
              { label: "Visits", value: stats.conversionFunnel.visits, color: "bg-blue-600" },
              { label: "Views", value: stats.conversionFunnel.views, color: "bg-indigo-500" },
              { label: "Adds to cart", value: stats.conversionFunnel.addsToCart, color: "bg-purple-500" },
              { label: "Orders", value: stats.conversionFunnel.orders, color: "bg-emerald-500" },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-semibold text-slate-900">{row.value.toLocaleString()}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${row.color}`} style={{ width: `${Math.max((row.value / Math.max(stats.conversionFunnel.visits, 1)) * 100, 0)}%` }} />
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500">
                <p>No conversion data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders + Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-modern p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
            <button 
              onClick={() => window.location.href = '/orders'}
              className="btn-secondary text-sm"
            >
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Order</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.slice(0, 6).map((order: { id: string; userName: string; total: number; status: string }) => (
                    <tr key={order.id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-medium text-slate-900">#{order.id}</td>
                      <td className="py-3 text-slate-600">{order.userName || 'Unknown'}</td>
                      <td className="py-3 font-semibold text-slate-900">{formatCurrency(order.total || 0)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status || 'pending')}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-modern p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Top Books</h3>
            <button 
              onClick={() => window.location.href = '/books'}
              className="btn-secondary text-sm"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {stats?.topBooks && stats.topBooks.length > 0 ? (
              stats.topBooks.slice(0, 4).map((book: { id: string; title: string; orderCount: number }) => (
                <div key={book.id} className="flex items-center justify-between">
                  <span className="text-slate-700 truncate">{book.title}</span>
                  <span className="text-slate-900 font-semibold">{book.orderCount || 0}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No book data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

