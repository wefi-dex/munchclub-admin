import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          books: {
            select: {
              id: true
            }
          },
          recipes: {
            select: {
              id: true
            }
          },
          Order: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count()
    ])

    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      orderCount: user.Order.length,
      bookCount: user.books.length,
      recipeCount: user.recipes.length
    }))

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      },
      stats: {
        totalUsers: totalCount,
        totalBooks: transformedUsers.reduce((sum, user) => sum + user.bookCount, 0),
        totalRecipes: transformedUsers.reduce((sum, user) => sum + user.recipeCount, 0),
        totalOrders: transformedUsers.reduce((sum, user) => sum + user.orderCount, 0)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
