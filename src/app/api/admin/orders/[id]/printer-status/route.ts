import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

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
      return NextResponse.json({
        success: true,
        message: 'No printer orders found for this order'
      })
    }

    // Check status for each printer order
    const printerStatuses = []
    
    for (const printerOrderId of order.printerOrderIds) {
      try {
        // Call the printer status API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/api/printer/checkOrderStatus?printerOrderId=${printerOrderId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          const statusData = await response.json()
          printerStatuses.push({
            printerOrderId,
            status: statusData.orderStatus?.status || 'unknown',
            trackingNumber: statusData.orderStatus?.trackingNumber,
            estimatedDelivery: statusData.orderStatus?.estimatedDelivery
          })
        } else {
          printerStatuses.push({
            printerOrderId,
            status: 'error',
            error: 'Failed to fetch status'
          })
        }
      } catch (error) {
        console.error(`Error checking status for printer order ${printerOrderId}:`, error)
        printerStatuses.push({
          printerOrderId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Update the order with the latest status
    const latestStatus = printerStatuses[0] // Use first printer order status
    if (latestStatus && latestStatus.status !== 'error') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          printerStatus: latestStatus.status,
          trackingNumber: latestStatus.trackingNumber || null,
          estimatedDelivery: latestStatus.estimatedDelivery ? new Date(latestStatus.estimatedDelivery) : null,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      printerStatuses,
      latestStatus: latestStatus?.status || 'unknown'
    })

  } catch (error) {
    console.error('Error refreshing printer status:', error)
    return NextResponse.json(
      { error: 'Failed to refresh printer status' },
      { status: 500 }
    )
  }
}

