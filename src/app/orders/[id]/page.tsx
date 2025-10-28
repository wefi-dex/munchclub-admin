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
  RefreshCw,
  Download,
  Eye,
  FileText,
  Image,
  Calendar,
  MessageSquare,
  Printer,
  ExternalLink
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
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)

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

  const handleFileView = (fileUrl: string) => {
    setSelectedFile(fileUrl)
    setFileViewerOpen(true)
  }

  const handleFileDownload = (fileUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileUrl: string) => {
    if (fileUrl.includes('.pdf')) return <FileText className="w-4 h-4" />
    if (fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return <Image className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getFileType = (fileUrl: string) => {
    if (fileUrl.includes('.pdf')) return 'PDF'
    if (fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'Image'
    return 'File'
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
              onClick={() => { setPendingStatus(status); setConfirmOpen(true) }}
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
          

          {/* Print Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Printer Integration</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Printer Order IDs */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Printer Order IDs</h4>
                  {order.printerOrderIds && order.printerOrderIds.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-w-md">
                      {order.printerOrderIds.slice(0, 5).map((printerOrderId, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          {printerOrderId}
                        </span>
                      ))}
                      {order.printerOrderIds.length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{order.printerOrderIds.length - 5} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No printer order IDs assigned</p>
                  )}
                </div>

                {/* Printer Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Printer Status</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                      order.printerStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                      order.printerStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.printerStatus === 'ERROR' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.printerStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Tracking Information */}
                {(order.trackingNumber || order.estimatedDelivery) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Tracking Information</h4>
                    <div className="space-y-2 max-w-md">
                      {order.trackingNumber && (
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600">Tracking:</span>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded truncate flex-1 min-w-0">
                            {order.trackingNumber}
                          </code>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600">Est. Delivery:</span>
                          <span className="text-sm font-medium">
                            {formatDate(order.estimatedDelivery)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Printer Error Messages */}
                {order.printerErrorMessage && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Printer Error</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-md">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700 break-words">{order.printerErrorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Printer Status Component */}
                <div className="max-w-sm">
                  <PrinterStatus
                    printerOrderIds={order.printerOrderIds || []}
                    printerStatus={order.printerStatus}
                    trackingNumber={order.trackingNumber}
                    estimatedDelivery={order.estimatedDelivery}
                    printerErrorMessage={order.printerErrorMessage}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Messages */}
          {order.messages && order.messages.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Messages</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.messages.map((message, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {message.type}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(message.timestamp)}
                        </p>
                      </div>
                      {message?.content && (
                        <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                      )}
                      {/* Render file URLs if present */}
                      {Array.isArray((message as any).fileUrls) && (message as any).fileUrls.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {((message as any).fileUrls as any[]).map((files, i) => {
                            const cover = files?.cover || files?.coverPdf || files?.coverUrl
                            const text = files?.text || files?.textPdf || files?.textUrl
                            return (
                              <div key={i} className="flex items-center gap-3 text-sm">
                                {cover && (
                                  <a
                                    href={cover}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" /> Cover PDF
                                  </a>
                                )}
                                {text && (
                                  <a
                                    href={text}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" /> Content PDF
                                  </a>
                                )}
                                {!cover && !text && (
                                  <span className="text-gray-400">No file links</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Order Status History */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order Process Timeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.orderStatusHistory && order.orderStatusHistory.length > 0 ? (
                  order.orderStatusHistory.map((history, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-600' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {history.status}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(history.timestamp)}
                          </p>
                        </div>
                        {history.note && (
                          <p className="text-xs text-gray-500 mt-1">{history.note}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{order.status}</p>
                        <p className="text-xs text-gray-500">Current status</p>
                        <p className="text-xs text-gray-400">{formatDate(order.updatedAt || order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">PENDING</p>
                        <p className="text-xs text-gray-500">Order created</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
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

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order ID</span>
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {order.id}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Items</span>
                <span className="text-sm font-medium">{order.summary?.totalItems ?? order.items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Quantity</span>
                <span className="text-sm font-medium">
                  {order.summary?.totalQuantity ?? order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Recipes</span>
                <span className="text-sm font-medium">
                  {order.summary?.totalRecipes ?? order.items.reduce((sum, item) => sum + (item.recipes || 0), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Pages (estimated)</span>
                <span className="text-sm font-medium">
                  {order.summary?.totalPages ?? order.items.reduce((sum, item) => sum + (item.pages || 0), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Multiple Addresses</span>
                <span className={`text-sm font-medium ${
                  order.isMultipleAddress ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {order.isMultipleAddress ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          
        </div>
      </div>

      {/* File Viewer Modal */}
      {fileViewerOpen && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">File Viewer</h3>
              <button
                onClick={() => setFileViewerOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {selectedFile.includes('.pdf') ? (
                <iframe
                  src={selectedFile}
                  className="w-full h-[70vh] border rounded"
                  title="PDF Viewer"
                />
              ) : (
                <img
                  src={selectedFile}
                  alt="File Preview"
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              )}
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t">
              <button
                onClick={() => handleFileDownload(selectedFile, 'file')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => setFileViewerOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Status Update Modal */}
      {confirmOpen && pendingStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Status Update</h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">
                Are you sure you want to update order <span className="font-mono font-medium">#{order.id}</span> to
                <span className="ml-1 font-semibold">{pendingStatus}</span>?
              </p>
              <p className="text-xs text-gray-500">This action will be recorded in the order history.</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => { setConfirmOpen(false); setPendingStatus(null) }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (pendingStatus) {
                    await handleStatusUpdate(pendingStatus)
                  }
                  setConfirmOpen(false)
                  setPendingStatus(null)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
