import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Types
interface PrinterStatusData {
  printerOrderId: string
  status: string
  trackingNumber?: string
  estimatedDelivery?: string
  error?: string
}

interface PrinterApiResponse {
  orderStatus?: {
    status: string
    trackingNumber?: string
    estimatedDelivery?: string
  }
}

interface PrinterStatusResponse {
  success: boolean
  printerStatuses: PrinterStatusData[]
  latestStatus: string
  message?: string
}

// Constants
const PRINTER_API_TIMEOUT = 10000 // 10 seconds

// Helper functions
async function fetchPrinterStatus(printerOrderId: string): Promise<PrinterStatusData> {
  const url = `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/api/printer/checkOrderStatus?printerOrderId=${printerOrderId}`
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PRINTER_API_TIMEOUT)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const statusData: PrinterApiResponse = await response.json()
    
    return {
      printerOrderId,
      status: statusData.orderStatus?.status || 'unknown',
      trackingNumber: statusData.orderStatus?.trackingNumber,
      estimatedDelivery: statusData.orderStatus?.estimatedDelivery
    }
  } catch (error) {
    console.error(`Error checking status for printer order ${printerOrderId}:`, error)
    
    return {
      printerOrderId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkAllPrinterStatuses(printerOrderIds: string[]): Promise<PrinterStatusData[]> {
  // Process all printer orders in parallel for better performance
  const statusPromises = printerOrderIds.map(printerOrderId => 
    fetchPrinterStatus(printerOrderId)
  )
  
  return Promise.all(statusPromises)
}

function determineLatestStatus(printerStatuses: PrinterStatusData[]): string {
  if (!printerStatuses.length) {
    return 'unknown'
  }

  // Status priority mapping (higher number = higher priority)
  const STATUS_PRIORITY: Record<string, number> = {
    'completed': 5,
    'delivered': 5,
    'shipped': 4,
    'processing': 3,
    'pending': 2,
    'error': 1,
    'unknown': 0
  } as const

  // Filter out error statuses and find the highest priority status
  const validStatuses = printerStatuses.filter(status => status.status !== 'error')
  
  if (validStatuses.length === 0) {
    return 'error'
  }

  // Find status with highest priority
  let highestPriorityStatus = validStatuses[0].status
  let highestPriority = STATUS_PRIORITY[highestPriorityStatus] || 0

  for (const status of validStatuses) {
    const priority = STATUS_PRIORITY[status.status] || 0
    if (priority > highestPriority) {
      highestPriority = priority
      highestPriorityStatus = status.status
    }
  }

  return highestPriorityStatus
}

// Map printer status to OrderStatus enum values
function mapPrinterStatusToOrderStatus(printerStatus: string): string {
  const statusMap: Record<string, string> = {
    'completed': 'DELIVERED',
    'delivered': 'DELIVERED',
    'shipped': 'SHIPPED',
    'processing': 'PROCESSING',
    'pending': 'PENDING',
    'error': 'ERROR',
    'unknown': 'PENDING'
  }
  
  return statusMap[printerStatus.toLowerCase()] || 'PENDING'
}

async function updateOrderStatus(orderId: string, latestStatus: PrinterStatusData): Promise<boolean> {
  // Skip update for error statuses
  if (latestStatus.status === 'error') {
    return false
  }

  try {
    const mappedStatus = mapPrinterStatusToOrderStatus(latestStatus.status)
    
    await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: mappedStatus as 'PENDING' | 'PROCESSING' | 'RECEIVED' | 'ACCEPTED' | 'PRINTED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'ERROR'
      }
    })
    
    return true
  } catch (error) {
    console.error(`Failed to update order ${orderId} status to ${latestStatus.status}:`, error)
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Validate order ID format
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      )
    }

    // Get order with printer order IDs
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        printerOrderIds: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (!order.printerOrderIds || order.printerOrderIds.length === 0) {
      const response: PrinterStatusResponse = {
        success: true,
        printerStatuses: [],
        latestStatus: 'no_printer_orders',
        message: 'No printer orders found for this order'
      }
      return NextResponse.json(response)
    }

    // Check status for all printer orders
    const printerStatuses = await checkAllPrinterStatuses(order.printerOrderIds)
    
    // Determine the latest status based on priority
    const latestStatusString = determineLatestStatus(printerStatuses)
    
    // Find the status data for the latest status
    const latestStatusData = printerStatuses.find(status => status.status === latestStatusString) || printerStatuses[0]

    // Update the order with the latest status
    await updateOrderStatus(orderId, latestStatusData)

    const response: PrinterStatusResponse = {
      success: true,
      printerStatuses,
      latestStatus: latestStatusString
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error refreshing printer status:', error)
    return NextResponse.json(
      { error: 'Failed to refresh printer status' },
      { status: 500 }
    )
  }
}

