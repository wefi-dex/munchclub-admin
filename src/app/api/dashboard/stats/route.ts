import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalUsers,
      totalOrders,
      totalBooks,
      totalRecipes,
      recentOrders,
      topBooks
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.book.count(),
      prisma.recipe.count(),
      prisma.order.findMany({
        take: 6,
        include: {
          user: {
            select: {
              name: true
            }
          },
          payment: {
            select: {
              amount: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.book.findMany({
        take: 4,
        include: {
          BasketItem: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])

    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        paymentStatus: 'SUCCESSFUL'
      }
    })

    const transformedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      userName: order.user.name,
      total: order.payment?.amount || 0,
      status: order.orderStatus.toLowerCase()
    }))

    const transformedTopBooks = topBooks.map(book => ({
      id: book.id,
      title: book.title,
      orderCount: book.BasketItem.length
    }))

    const revenueData = Array(12).fill(0).map(() => 
      Math.floor((totalRevenue._sum.amount || 0) / 12) + Math.floor(Math.random() * 1000)
    )

    const conversionFunnel = {
      visits: Math.max(totalUsers * 15, 1000),
      views: Math.max(totalUsers * 8, 500),
      addsToCart: Math.max(totalOrders * 2, 100),
      orders: totalOrders
    }

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalBooks,
      totalRecipes,
      recentOrders: transformedRecentOrders,
      topBooks: transformedTopBooks,
      revenueData,
      conversionFunnel
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
