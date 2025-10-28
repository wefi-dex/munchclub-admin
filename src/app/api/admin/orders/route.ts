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
    pendingOrders: number
    deliveredOrders: number
    shippedOrders: number
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
  user: { name: string | null; email: string | null } | null
  basketItems?: Array<{
    id: string
    bookId: string
    book: { title: string } | null
    quantity: number
  }>
  purchasedBooks?: any
  payment: { id: string; amount: number; paymentStatus: string } | null
  orderStatus: string
  createdAt: Date
  updatedAt?: Date
  printerOrderIds: string[]
}): TransformedOrder {
  // Try to get items from basketItems or fallback to purchasedBooks
  let items: Array<{ id: string; productId: string; productName: string; quantity: number; price: number }> = []
  
  if (order.basketItems && order.basketItems.length > 0) {
    items = order.basketItems.map((item) => ({
      id: item.id,
      productId: item.bookId,
      productName: item.book?.title || 'Unknown Book',
      quantity: item.quantity,
      price: 0 // TODO: Add actual price from book data
    }))
  } else if (order.purchasedBooks && Array.isArray(order.purchasedBooks)) {
    items = order.purchasedBooks.map((book: any, index: number) => ({
      id: `book-${index}`,
      productId: book.bookId || '',
      productName: book.title || 'Unknown Book',
      quantity: book.quantity || 1,
      price: book.price || 0
    }))
  }

  return {
    id: order.id,
    userId: order.userId,
    userName: order.user?.name || '',
    userEmail: order.user?.email || '',
    items,
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

async function calculateStats() {
  const [totalOrders, pendingOrders, deliveredOrders, shippedOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: 'PENDING' } }),
    prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
    prisma.order.count({ where: { orderStatus: 'SHIPPED' } })
  ])

  return {
    totalOrders,
    pendingOrders,
    deliveredOrders,
    shippedOrders
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePaginationParams(searchParams)
    const q = (searchParams.get('q') || '').trim()
    const status = (searchParams.get('status') || '').trim().toUpperCase()
    const sortField = (searchParams.get('sortField') || 'date').trim().toLowerCase()
    const sortDir = ((searchParams.get('sortDir') || 'desc').trim().toLowerCase() === 'asc') ? 'asc' : 'desc'

    // Build dynamic filters
    const andFilters: any[] = []
    if (q) {
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(q)
      andFilters.push({
        OR: [
          { user: { name: { contains: q, mode: 'insensitive' } } },
          { user: { email: { contains: q, mode: 'insensitive' } } },
          { basketItems: { some: { book: { title: { contains: q, mode: 'insensitive' } } } } },
          // Allow exact match on order id only if valid ObjectId
          ...(isObjectId ? [{ id: q }] as any[] : [])
        ]
      })
    }
    if (status && ['PENDING','PROCESSING','RECEIVED','ACCEPTED','PRINTED','SHIPPED','DELIVERED','CANCELLED','ERROR'].includes(status)) {
      andFilters.push({ orderStatus: status })
    }
    const where = andFilters.length ? { AND: andFilters } : undefined

    // Determine orderBy mapping
    let orderBy: any = { createdAt: sortDir }
    // For customer sorting we'll sort in-memory after transformation to avoid relation sort issues
    if (sortField === 'status') orderBy = { orderStatus: sortDir }
    else if (sortField === 'total') orderBy = { payment: { amount: sortDir } }
    else if (sortField === 'date') orderBy = { createdAt: sortDir }

    // Fetch orders and total count in parallel
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
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
        orderBy
      })
        .then(orders => orders.filter(Boolean)),
      prisma.order.count({ where })
    ])

    // Transform orders
    let transformedOrders = orders.map(transformOrder)
    if (sortField === 'customer') {
      transformedOrders = transformedOrders.sort((a, b) => {
        const av = (a.userName || '').toLowerCase()
        const bv = (b.userName || '').toLowerCase()
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    // Calculate pagination and stats
    const totalPages = Math.ceil(totalCount / limit)
    const stats = await calculateStats()

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
