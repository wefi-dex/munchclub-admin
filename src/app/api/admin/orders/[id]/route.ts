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
  coverUrl?: string
  contentUrl?: string
  jobReference?: string
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
  messages?: Array<{
    type: string
    content: string
    timestamp: string
  }>
  purchasedBooks?: any
  isMultipleAddress?: boolean
  // Precomputed summary fields
  summary?: {
    totalItems: number
    totalQuantity: number
    totalRecipes: number
    totalPages: number
  }
}

// Calculate total pages based on number of recipes
function calculateTotalBookPages(numberOfRecipes: number): number {
  const defaultPages = 16
  const recipePages = numberOfRecipes * 2
  const recipeListPageCount = Math.ceil(numberOfRecipes / 14)

  let additionalPages = 0

  if (recipeListPageCount <= 2) {
    additionalPages = 0
  } else if (recipeListPageCount <= 4) {
    additionalPages = 2
  } else {
    additionalPages = 4 + Math.ceil((recipeListPageCount - 5) / 2) * 2
  }

  return defaultPages + recipePages + additionalPages
}

function transformOrderDetail(order: {
  id: string
  userId: string
  user: { name: string; email: string | null }
  basketItems: Array<{
    id: string
    book: { id: string; title: string; recipes: Array<{ id: string }> } | null
    typePrice: { price: number } | null
    type: string
    quantity: number
    coverUrl?: string | null
    contentUrl?: string | null
  }>
  orderShippings: Array<{
    shippingAddress: {
      firstName: string
      lastName: string
      addressLine1: string
      addressLine2: string | null
      town: string
      county: string
      postCode: string
      country: string
    }
  }>
  statusHistory: Array<{
    status: string
    timestamp: Date
    message: unknown
  }>
  createdAt: Date
  orderStatus: string
  payment: {
    id: string
    amount: number
    paymentStatus: string
    stripePaymentId?: string
  } | null
  printerOrderIds?: string[]
  messages?: any[]
  purchasedBooks?: any
  isMultipleAddress?: boolean
}): OrderDetail {
  // Get shipping address from orderShippings
  const shippingAddress = order.orderShippings?.[0]?.shippingAddress || {}
  
  // Find file URLs from messages as fallback (supports multiple message formats)
  const fileMessage = order.messages?.find((msg: any) => 
    msg?.type === "file_urls" || msg?.type === "printer_files"
  ) as any
  const rawFallback = (fileMessage?.fileUrls ?? []) as any[]
  const fallbackFileUrls = Array.isArray(rawFallback) ? rawFallback : []
  
  // Transform status history
  const orderStatusHistory = order.statusHistory?.map((history) => ({
    status: history.status,
    timestamp: history.timestamp.toISOString(),
    note: typeof history.message === 'object' && history.message !== null && 'note' in history.message 
      ? (history.message as { note: string }).note 
      : ''
  })) || []

  return {
    id: order.id,
    userId: order.userId,
    userName: order.user.name,
    userEmail: order.user.email || '',
    items: order.basketItems.map((item, index) => {
      // Use file URLs from basket item, or fallback to messages
      const fallbackFileUrl = fallbackFileUrls[index]
      return {
        id: item.id,
        productId: item.book?.id || '',
        productName: item.book?.title || 'Unknown Book',
        quantity: item.quantity,
        price: item.typePrice?.price || 0,
        pages: calculateTotalBookPages(item.book?.recipes?.length || 0),
        recipes: item.book?.recipes?.length || 0,
        type: item.type || 'Unknown',
        // Prefer item URLs; then email/printer upload URLs from messages.
        coverUrl: item.coverUrl 
          || fallbackFileUrl?.cover 
          || fallbackFileUrl?.coverPdf 
          || fallbackFileUrl?.coverUrl 
          || undefined,
        contentUrl: item.contentUrl 
          || fallbackFileUrl?.text 
          || fallbackFileUrl?.textPdf 
          || fallbackFileUrl?.textUrl 
          || undefined,
        jobReference: `${order.id}-${item.id}` // Generate job reference
      }
    }),
    total: order.payment?.amount || 0,
    status: order.orderStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.createdAt.toISOString(), // Use createdAt as fallback since Order model doesn't have updatedAt
    shippingAddress: {
      firstName: shippingAddress.firstName,
      lastName: shippingAddress.lastName,
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2 || undefined,
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
    orderStatusHistory,
    messages: order.messages || [],
    purchasedBooks: order.purchasedBooks || null,
    isMultipleAddress: order.isMultipleAddress || false,
    summary: (() => {
      const hasBasket = Array.isArray(order.basketItems) && order.basketItems.length > 0
      const hasPurchased = Array.isArray(order.purchasedBooks) && order.purchasedBooks.length > 0

      if (hasBasket) {
        const totalItems = order.basketItems.length
        const totalQuantity = order.basketItems.reduce((sum, bi) => sum + (bi.quantity || 0), 0)
        const totalRecipes = order.basketItems.reduce((sum, bi) => sum + (bi.book?.recipes?.length || 0), 0)
        const totalPages = order.basketItems.reduce((sum, bi) => sum + calculateTotalBookPages(bi.book?.recipes?.length || 0), 0)
        return { totalItems, totalQuantity, totalRecipes, totalPages }
      }

      if (hasPurchased) {
        const purchased = order.purchasedBooks as Array<{ quantity?: number; numberOfRecipes?: number; pages?: number; }>
        const totalItems = purchased.length
        const totalQuantity = purchased.reduce((sum, it) => sum + (it.quantity || 0), 0)
        const totalRecipes = purchased.reduce((sum, it) => sum + (it.numberOfRecipes || 0), 0)
        const totalPages = purchased.reduce((sum, it) => sum + (it.pages || 0), 0)
        return { totalItems, totalQuantity, totalRecipes, totalPages }
      }

      return { totalItems: 0, totalQuantity: 0, totalRecipes: 0, totalPages: 0 }
    })()
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
          select: {
            id: true,
            bookId: true,
            type: true,
            quantity: true,
            coverUrl: true,
            contentUrl: true,
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
          select: {
            id: true,
            bookId: true,
            type: true,
            quantity: true,
            coverUrl: true,
            contentUrl: true,
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

export async function DELETE(
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

    // Clean up related records first, then delete order (sequentially to avoid transaction conflicts)
    await prisma.orderShipping.deleteMany({ where: { orderId } }).catch(() => {})
    await prisma.orderStatusHistory.deleteMany({ where: { orderId } }).catch(() => {})
    await prisma.payment.deleteMany({ where: { orderId } }).catch(() => {})
    await prisma.basketItem.updateMany({ where: { orderId }, data: { orderId: null } }).catch(() => {})
    await prisma.order.deleteMany({ where: { id: orderId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
