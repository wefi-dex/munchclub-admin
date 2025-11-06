'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, RefreshCw, Tag, CheckCircle, XCircle, Calendar, Mail, User, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

type Coupon = {
  _id: string
  transactionId?: string
  purchaserEmail?: string
  recipientEmail?: string
  purchaserName?: string
  recipientName?: string
  amount?: number
  couponCode?: string
  status?: string
  timestamp?: string
  redeemed?: boolean
  redeemedAt?: string
}

type CouponStats = {
  totalCoupons: number
  redeemedCoupons: number
  activeCoupons: number
  totalValue: number
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'redeemed' | 'active'>('all')
  
  // Confirmation modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [couponToRedeem, setCouponToRedeem] = useState<Coupon | null>(null)
  const [markingRedeemed, setMarkingRedeemed] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Stats state
  const [stats, setStats] = useState<CouponStats>({
    totalCoupons: 0,
    redeemedCoupons: 0,
    activeCoupons: 0,
    totalValue: 0
  })

  const load = useCallback(async (page: number = currentPage, limit: number = pageSize, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (q.trim()) params.set('q', q.trim())
      
      const url = `/api/admin/coupons?${params.toString()}`
      console.log('🔍 Fetching coupons from:', url)
      const res = await fetch(url, { cache: 'no-store' })
      
      if (!res.ok) {
        const t = await res.text()
        console.error('❌ API Error:', res.status, t)
        throw new Error(`HTTP ${res.status}: ${t}`)
      }
      
      const json = await res.json()
      console.log('✅ API Response:', json)
      const items = json.data || []
      console.log('📦 Items received:', items.length)
      
      setCoupons(items)
      setTotalPages(json.pagination?.totalPages || 1)
      setTotalCount(json.pagination?.totalCount || 0)
      setCurrentPage(json.pagination?.currentPage || page)
      
      // Use stats from API response if available, otherwise calculate from current page
      if (json.stats) {
        setStats(json.stats)
      } else {
        // Fallback: calculate from current page items
        const totalCoupons = json.pagination?.totalCount || 0
        const redeemedCount = items.filter((c: Coupon) => c.redeemed).length
        const activeCount = items.filter((c: Coupon) => !c.redeemed).length
        const pageValue = items.reduce((sum: number, c: Coupon) => sum + (c.amount || 0), 0)
        
        setStats({
          totalCoupons,
          redeemedCoupons: redeemedCount,
          activeCoupons: activeCount,
          totalValue: pageValue
        })
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load coupons')
      setCoupons([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [q, currentPage, pageSize])

  useEffect(() => {
    load(1, pageSize)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (q !== undefined) {
        setCurrentPage(1)
        load(1, pageSize)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [q]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter coupons based on status
  const filteredCoupons = coupons.filter(c => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'redeemed') return c.redeemed === true
    if (statusFilter === 'active') return c.redeemed !== true
    return true
  })

  const handleMarkRedeemedClick = (coupon: Coupon) => {
    setCouponToRedeem(coupon)
    setConfirmModalOpen(true)
  }

  const handleConfirmRedeem = async () => {
    if (!couponToRedeem) return
    
    setMarkingRedeemed(true)
    try {
      const res = await fetch(`/api/admin/coupons/${couponToRedeem._id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to mark as redeemed')
      setConfirmModalOpen(false)
      setCouponToRedeem(null)
      load(currentPage, pageSize, true)
    } catch (error) {
      console.error('Failed to mark coupon as redeemed:', error)
      setError('Failed to update coupon status')
      setMarkingRedeemed(false)
    } finally {
      setMarkingRedeemed(false)
    }
  }

  const handleCancelRedeem = () => {
    setConfirmModalOpen(false)
    setCouponToRedeem(null)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      load(newPage, pageSize)
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
    load(1, newSize)
  }

  const handleRefresh = () => {
    load(currentPage, pageSize, true)
  }

  const submitSearch = () => {
    setCurrentPage(1)
    load(1, pageSize)
  }

  if (loading && coupons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Coupons</h1>
          <p className="text-slate-600 mt-1">Manage gift coupons and redemption status</p>
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Coupons</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCoupons}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Coupons</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeCoupons}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Redeemed</p>
              <p className="text-2xl font-bold text-slate-900">{stats.redeemedCoupons}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Value</p>
              <p className="text-2xl font-bold text-slate-900">£{stats.totalValue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-modern p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <button onClick={submitSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" title="Search">
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Search by code, email, or name..."
              className="input-modern pl-10"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch() }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="input-modern w-auto"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'redeemed' | 'active')
                setCurrentPage(1)
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="redeemed">Redeemed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="card-modern overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Date</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Tag className="w-4 h-4" />
                    <span>Code</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Purchaser</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>Recipient</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCoupons.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {c.timestamp ? new Date(c.timestamp).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {c.couponCode || 'N/A'}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">£{c.amount?.toFixed(2) || '0.00'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {c.purchaserName || 'N/A'}
                    </div>
                    {c.purchaserEmail && (
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {c.purchaserEmail}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {c.recipientName || 'N/A'}
                    </div>
                    {c.recipientEmail && (
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {c.recipientEmail}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {c.redeemed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Redeemed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!c.redeemed && (
                      <button
                        onClick={() => handleMarkRedeemedClick(c)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                      >
                        Mark Redeemed
                      </button>
                    )}
                    {c.redeemed && c.redeemedAt && (
                      <span className="text-xs text-slate-500">
                        Redeemed {new Date(c.redeemedAt).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCoupons.length === 0 && !loading && (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No coupons found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="card-modern p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-slate-600">per page</span>
            </div>

            {/* Pagination Info */}
            <div className="text-sm text-slate-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} coupons
            </div>

            {/* Pagination Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalOpen && couponToRedeem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Mark Coupon as Redeemed?</h3>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-slate-700">
                Are you sure you want to mark this coupon as redeemed?
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-600">Coupon Code:</span>
                  <code className="text-sm font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {couponToRedeem.couponCode}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-600">Amount:</span>
                  <span className="text-sm font-semibold text-slate-900">£{couponToRedeem.amount?.toFixed(2) || '0.00'}</span>
                </div>
                {couponToRedeem.recipientName && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600">Recipient:</span>
                    <span className="text-sm text-slate-900">{couponToRedeem.recipientName}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-md p-3">
                ⚠️ This action cannot be undone. The coupon will be marked as redeemed permanently.
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-slate-50">
              <button
                onClick={handleCancelRedeem}
                disabled={markingRedeemed}
                className="px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedeem}
                disabled={markingRedeemed}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {markingRedeemed ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Marking...
                  </span>
                ) : (
                  'Confirm & Mark Redeemed'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
