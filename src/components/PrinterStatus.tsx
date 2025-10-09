'use client'

import { useState } from 'react'
import { Package, Truck, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'

interface PrinterStatusProps {
  printerOrderIds: string[]
  printerStatus?: string
  trackingNumber?: string
  estimatedDelivery?: string
  printerErrorMessage?: string
  onRefresh?: () => void
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Pending'
  },
  processing: {
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Processing'
  },
  printed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Printed'
  },
  shipped: {
    icon: Truck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Shipped'
  },
  delivered: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Delivered'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Failed'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Cancelled'
  }
}

export default function PrinterStatus({ 
  printerOrderIds, 
  printerStatus, 
  trackingNumber, 
  estimatedDelivery, 
  printerErrorMessage,
  onRefresh 
}: PrinterStatusProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  if (!printerOrderIds || printerOrderIds.length === 0) {
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <AlertCircle className="w-4 h-4 mr-2" />
        No printer orders
      </div>
    )
  }

  const status = printerStatus || 'pending'
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <div className="space-y-2">
      {/* Printer Order IDs */}
      <div className="text-xs text-gray-600">
        Printer Orders: {printerOrderIds.join(', ')}
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </div>
        
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Tracking Information */}
      {trackingNumber && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Tracking:</span> {trackingNumber}
        </div>
      )}

      {/* Estimated Delivery */}
      {estimatedDelivery && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Est. Delivery:</span> {new Date(estimatedDelivery).toLocaleDateString()}
        </div>
      )}

      {/* Error Message */}
      {printerErrorMessage && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          <span className="font-medium">Error:</span> {printerErrorMessage}
        </div>
      )}
    </div>
  )
}



