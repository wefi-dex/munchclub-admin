'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, MoreVertical, Eye, Package, Truck, CheckCircle, RefreshCw, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Order } from '@/types'
import { apiClient } from '@/lib/api'
import PrinterStatus from '@/components/PrinterStatus'

export default function OrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [refreshing, setRefreshing] = useState(false)
    const [sortField, setSortField] = useState<'date'|'customer'|'status'|'total'>('date')
    const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    
    // Default stats object
    const defaultStats = {
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        shippedOrders: 0
    }

    // Stats state
    const [stats, setStats] = useState(defaultStats)

    const fetchOrders = async (
        page: number = currentPage,
        limit: number = pageSize,
        isRefresh = false,
        qOverride?: string,
        statusOverride?: string,
        sortFieldOverride?: typeof sortField,
        sortDirOverride?: typeof sortDir
    ) => {
        const qVal = (qOverride !== undefined ? qOverride : searchTerm).trim()
        const statusVal = (statusOverride !== undefined ? statusOverride : statusFilter)
        const sfVal = (sortFieldOverride !== undefined ? sortFieldOverride : sortField)
        const sdVal = (sortDirOverride !== undefined ? sortDirOverride : sortDir)

        // Set loading state
        setRefreshing(Boolean(isRefresh))
        setLoading(!isRefresh)

        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortField: sfVal,
                sortDir: sdVal,
            })
            if (qVal) params.set('q', qVal)
            if (statusVal !== 'all') params.set('status', statusVal)

            const url = `/admin/orders?${params.toString()}`
            const response = await apiClient.request<any>(url)

            setOrders((response?.orders as Order[]) || [])
            setTotalPages(response?.pagination?.totalPages || 1)
            setTotalCount(response?.pagination?.totalCount || 0)
            setCurrentPage(response?.pagination?.currentPage || 1)
            setStats((response?.stats as typeof defaultStats) || defaultStats)
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            setOrders([])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        // Initial fetch
        fetchOrders(1, pageSize)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const submitSearch = () => {
        setCurrentPage(1)
        fetchOrders(1, pageSize, false, searchTerm, statusFilter, sortField, sortDir)
    }

    // Pagination handlers
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
            fetchOrders(newPage, pageSize)
        }
    }

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize)
        setCurrentPage(1)
        fetchOrders(1, newSize)
    }

    const handleRefresh = () => {
        fetchOrders(currentPage, pageSize, true)
    }

    // Data is already filtered on the server
    const filteredOrders = orders

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Package className="w-4 h-4" />
            case 'processing': return <Package className="w-4 h-4" />
            case 'received': return <Package className="w-4 h-4" />
            case 'accepted': return <Package className="w-4 h-4" />
            case 'printed': return <Package className="w-4 h-4" />
            case 'shipped': return <Truck className="w-4 h-4" />
            case 'delivered': return <CheckCircle className="w-4 h-4" />
            case 'cancelled': return <Package className="w-4 h-4" />
            case 'error': return <Package className="w-4 h-4" />
            default: return <Package className="w-4 h-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'processing': return 'bg-blue-100 text-blue-800'
            case 'received': return 'bg-blue-100 text-blue-800'
            case 'accepted': return 'bg-blue-100 text-blue-800'
            case 'printed': return 'bg-purple-100 text-purple-800'
            case 'shipped': return 'bg-purple-100 text-purple-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            case 'error': return 'bg-red-100 text-red-800'
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600">Manage customer orders and fulfillment</p>
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

            {/* Order Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Package className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Delivered</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Truck className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Shipped</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.shippedOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <button onClick={submitSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" title="Search">
                            <Search className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') submitSearch() }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { const val = e.target.value; setStatusFilter(val); setCurrentPage(1); fetchOrders(1, pageSize, false, searchTerm, val, sortField, sortDir) }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="received">Received</option>
                        <option value="accepted">Accepted</option>
                        <option value="printed">Printed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="error">Error</option>
                    </select>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>More Filters</span>
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                
                                <th
                                    onClick={() => {
                                        const nextDir = sortField === 'customer' && sortDir === 'asc' ? 'desc' : 'asc'
                                        setSortField('customer'); setSortDir(nextDir as any)
                                        fetchOrders(1, pageSize, false, searchTerm, statusFilter, 'customer', nextDir as any)
                                    }}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                    title="Sort by customer"
                                >
                                    Customer {sortField === 'customer' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th
                                    onClick={() => {
                                        const nextDir = sortField === 'total' && sortDir === 'asc' ? 'desc' : 'asc'
                                        setSortField('total'); setSortDir(nextDir as any)
                                        fetchOrders(1, pageSize, false, searchTerm, statusFilter, 'total', nextDir as any)
                                    }}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                    title="Sort by total"
                                >
                                    Total {sortField === 'total' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th
                                    onClick={() => {
                                        const nextDir = sortField === 'status' && sortDir === 'asc' ? 'desc' : 'asc'
                                        setSortField('status'); setSortDir(nextDir as any)
                                        fetchOrders(1, pageSize, false, searchTerm, statusFilter, 'status', nextDir as any)
                                    }}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                    title="Sort by status"
                                >
                                    Status {sortField === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                                    Printer Status
                                </th>
                                <th
                                    onClick={() => {
                                        const nextDir = sortField === 'date' && sortDir === 'asc' ? 'desc' : 'asc'
                                        setSortField('date'); setSortDir(nextDir as any)
                                        fetchOrders(1, pageSize, false, searchTerm, statusFilter, 'date', nextDir as any)
                                    }}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                    title="Sort by date"
                                >
                                    Date {sortField === 'date' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={() => router.push(`/orders/${order.id}`)}
                                    className="hover:bg-gray-50 cursor-pointer"
                                >
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                                        <div className="text-sm text-gray-500">{order.userEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{order.items.length} item(s)</div>
                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                            {order.items.map(item => `${item.productName} (×${item.quantity})`).join(', ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">${order.total.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.payment ? (
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                                order.payment.status === 'successful' ? 'bg-green-100 text-green-800' :
                                                order.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                <span className="capitalize">{order.payment.status}</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                No Payment
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="ml-1 capitalize">{order.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-2 py-4 whitespace-nowrap w-32">
                                        <div className="max-w-[250px] overflow-hidden text-ellipsis">
                                            <PrinterStatus
                                                printerOrderIds={order.printerOrderIds || []}
                                                printerStatus={order.printerStatus}
                                                trackingNumber={order.trackingNumber}
                                                estimatedDelivery={order.estimatedDelivery}
                                                printerErrorMessage={order.printerErrorMessage}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                onClick={() => router.push(`/orders/${order.id}`)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Order Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => { setOrderToDelete(order.id); setDeleteModalOpen(true) }}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete Order"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="text-indigo-600 hover:text-indigo-900">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalCount > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        {/* Page Size Selector */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-sm text-gray-600">per page</span>
                        </div>

                        {/* Pagination Info */}
                        <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} orders
                        </div>

                        {/* Pagination Navigation */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                    : 'border border-gray-300 hover:bg-gray-50'
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
                                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {deleteModalOpen && orderToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-5 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className="text-sm text-gray-700">Are you sure you want to delete this order?</p>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t">
                            <button
                                onClick={() => { setDeleteModalOpen(false); setOrderToDelete(null) }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (deleting) return
                                    setDeleting(true)
                                    try {
                                        await apiClient.request(`/admin/orders/${orderToDelete}`, { method: 'DELETE' })
                                        setDeleteModalOpen(false)
                                        setOrderToDelete(null)
                                        fetchOrders(currentPage, pageSize, true, searchTerm, statusFilter, sortField, sortDir)
                                    } catch (err) {
                                        console.error('Failed to delete order:', err)
                                    } finally {
                                        setDeleting(false)
                                    }
                                }}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-red-400"
                            >
                                {deleting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Deleting...
                                    </span>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}







