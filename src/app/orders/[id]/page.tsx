'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  User, 
  Mail, 
  MapPin, 
  CreditCard,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { Order } from '@/types'
import { apiClient } from '@/lib/api'
import PrinterStatus from '@/components/PrinterStatus'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const orderData = await apiClient.getOrder(orderId)
      setOrder(orderData as Order)
    } catch (err) {
      console.error('Failed to fetch order:', err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId, fetchOrder])

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdating(true)
      await apiClient.updateOrderStatus(orderId, newStatus)
      await fetchOrder() // Refresh the order data
    } catch (err) {
      console.error('Failed to update order status:', err)
      setError('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'processing': return <Package className="w-4 h-4" />
      case 'received': return <Package className="w-4 h-4" />
      case 'accepted': return <Package className="w-4 h-4" />
      case 'printed': return <Package className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium text-gray-900">{error || 'Order not found'}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">£{order.total.toFixed(2)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Status Update Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
        <div className="flex flex-wrap gap-2">
          {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              disabled={updating || order.status === status}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                order.status === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {updating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                status
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pages
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.type || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          £{item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          £{(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.pages || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.recipes || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Print Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Print Status</h3>
            </div>
            <div className="p-6">
              <PrinterStatus
                printerOrderIds={order.printerOrderIds || []}
                printerStatus={order.printerStatus}
                trackingNumber={order.trackingNumber}
                estimatedDelivery={order.estimatedDelivery}
                printerErrorMessage={order.printerErrorMessage}
              />
            </div>
          </div>

          {/* Order Status History */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order Status History</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{order.status}</p>
                    <p className="text-xs text-gray-500">Order updated</p>
                    <p className="text-xs text-gray-400">{formatDate(order.updatedAt || order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">PENDING</p>
                    <p className="text-xs text-gray-500">Order created</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.userName}</p>
                  <p className="text-xs text-gray-500">Customer Name</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.userEmail}</p>
                  <p className="text-xs text-gray-500">Email Address</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
            </div>
            <div className="p-6">
              {order.shippingAddress && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && (
                        <p className="text-sm text-gray-600">{order.shippingAddress.addressLine2}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.town}, {order.shippingAddress.county}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.postCode}, {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {!order.shippingAddress && (
                <p className="text-sm text-gray-500">No shipping address provided.</p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
            </div>
            <div className="p-6 space-y-4">
              {order.payment ? (
                <>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">£{order.payment.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Amount</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5"></div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        order.payment.status === 'successful' ? 'bg-green-100 text-green-800' :
                        order.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <span className="capitalize">{order.payment.status}</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Payment Status</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No payment information available.</p>
              )}
            </div>
          </div>

          {/* Printer Files */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Printer Files</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500">No printer files available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
