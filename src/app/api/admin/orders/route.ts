import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Types
interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
}

interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PaymentInfo {
  id: string
  status: string
  amount: number
}

interface TransformedOrder {
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
}

interface OrdersResponse {
  orders: TransformedOrder[]
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
  }
  stats: {
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    completedOrders: number
  }
}

// Constants
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

// Helper functions
function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || String(DEFAULT_PAGE)))
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))))
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}

function transformOrder(order: {
  id: string
  userId: string
  user: { name: string; email: string }
  basketItems: Array<{
    id: string
    bookId: string
    book: { title: string }
    quantity: number
  }>
  payment?: { id: string; amount: number; paymentStatus: string }
  orderStatus: string
  createdAt: Date
  updatedAt?: Date
  printerOrderIds: string[]
}): TransformedOrder {
  return {
    id: order.id,
    userId: order.userId,
    userName: order.user.name,
    userEmail: order.user.email,
    items: order.basketItems.map((item) => ({
      id: item.id,
      productId: item.bookId,
      productName: item.book.title,
      quantity: item.quantity,
      price: 0 // TODO: Add actual price from book data
    })),
    total: order.payment?.amount || 0,
    status: order.orderStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    payment: order.payment ? {
      id: order.payment.id,
      status: order.payment.paymentStatus,
      amount: order.payment.amount
    } : undefined,
    printerOrderIds: order.printerOrderIds || []
  }
}

function calculateStats(orders: TransformedOrder[], totalCount: number) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length
  const completedOrders = orders.filter(order => order.status === 'DELIVERED').length

  return {
    totalOrders: totalCount,
    totalRevenue,
    pendingOrders,
    completedOrders
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePaginationParams(searchParams)

    // Fetch orders and total count in parallel
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
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
                  title: true
                }
              }
            }
          },
          payment: {
            select: {
              id: true,
              amount: true,
              paymentStatus: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.order.count()
    ])

    // Transform orders
    const transformedOrders = orders.map(transformOrder)

    // Calculate pagination and stats
    const totalPages = Math.ceil(totalCount / limit)
    const stats = calculateStats(transformedOrders, totalCount)

    const response: OrdersResponse = {
      orders: transformedOrders,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page
      },
      stats
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
