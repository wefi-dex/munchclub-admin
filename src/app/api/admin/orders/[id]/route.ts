import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Types
interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  pages?: number
  recipes?: number
  type?: string
}

interface ShippingAddress {
  firstName?: string
  lastName?: string
  addressLine1?: string
  addressLine2?: string
  town?: string
  county?: string
  postCode?: string
  country?: string
}

interface PaymentInfo {
  id: string
  status: string
  amount: number
  stripePaymentId?: string
}

interface OrderDetail {
  id: string
  userId: string
  userName: string
  userEmail: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  updatedAt?: string
  shippingAddress: ShippingAddress
  payment?: PaymentInfo
  printerOrderIds: string[]
  printerStatus?: string
  trackingNumber?: string
  estimatedDelivery?: string
  printerErrorMessage?: string
  orderStatusHistory?: Array<{
    status: string
    timestamp: string
    note?: string
  }>
}

function transformOrderDetail(order: any): OrderDetail {
  // Get shipping address from orderShippings
  const shippingAddress = order.orderShippings?.[0]?.shippingAddress || {}
  
  // Transform status history
  const orderStatusHistory = order.statusHistory?.map((history: any) => ({
    status: history.status,
    timestamp: history.timestamp.toISOString(),
    note: history.message?.note || ''
  })) || []

  return {
    id: order.id,
    userId: order.userId,
    userName: order.user.name,
    userEmail: order.user.email || '',
    items: order.basketItems.map((item: any) => ({
      id: item.id,
      productId: item.bookId,
      productName: item.book.title,
      quantity: item.quantity,
      price: item.typePrice?.price || 0,
      pages: 0, // This would need to be calculated from recipes
      recipes: item.book?.recipes?.length || 0,
      type: item.type || 'Unknown'
    })),
    total: order.payment?.amount || 0,
    status: order.orderStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.createdAt.toISOString(), // Use createdAt as fallback since Order model doesn't have updatedAt
    shippingAddress: {
      firstName: shippingAddress.firstName,
      lastName: shippingAddress.lastName,
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2,
      town: shippingAddress.town,
      county: shippingAddress.county,
      postCode: shippingAddress.postCode,
      country: shippingAddress.country
    },
    payment: order.payment ? {
      id: order.payment.id,
      status: order.payment.paymentStatus,
      amount: order.payment.amount,
      stripePaymentId: order.payment.stripePaymentId
    } : undefined,
    printerOrderIds: order.printerOrderIds || [],
    printerStatus: 'PENDING', // This would need to be fetched from printer API
    trackingNumber: undefined,
    estimatedDelivery: undefined,
    printerErrorMessage: undefined,
    orderStatusHistory
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        basketItems: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                recipes: {
                  select: {
                    id: true
                  }
                }
              }
            },
            typePrice: {
              select: {
                price: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            paymentStatus: true,
            stripePaymentId: true
          }
        },
        orderShippings: {
          include: {
            shippingAddress: true
          }
        },
        statusHistory: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Transform order data
    const transformedOrder = transformOrderDetail(order)

    return NextResponse.json(transformedOrder)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const body = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: body.status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        basketItems: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                recipes: {
                  select: {
                    id: true
                  }
                }
              }
            },
            typePrice: {
              select: {
                price: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            paymentStatus: true,
            stripePaymentId: true
          }
        },
        orderShippings: {
          include: {
            shippingAddress: true
          }
        },
        statusHistory: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    })

    // Add status history entry
    await prisma.orderStatusHistory.create({
      data: {
        orderId: orderId,
        status: body.status,
        message: { note: body.note || `Status updated to ${body.status}` },
        timestamp: new Date()
      }
    })

    const transformedOrder = transformOrderDetail(updatedOrder)

    return NextResponse.json(transformedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
