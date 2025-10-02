import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

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

    const transformedOrders = orders.map(order => ({
      id: order.id,
      userId: order.userId,
      userName: order.user.name,
      userEmail: order.user.email,
      items: order.basketItems.map(item => ({
        id: item.id,
        productId: item.bookId,
        productName: item.book.title,
        quantity: item.quantity,
        price: 0
      })),
      total: order.payment?.amount || 0,
      status: order.orderStatus,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.createdAt.toISOString(),
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
      } : undefined
    }))

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      },
      stats: {
        totalOrders: totalCount,
        totalRevenue: transformedOrders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: transformedOrders.filter(order => order.status === 'PENDING').length,
        completedOrders: transformedOrders.filter(order => order.status === 'DELIVERED').length
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
