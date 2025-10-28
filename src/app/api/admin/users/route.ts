import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const q = (searchParams.get('q') || '').trim()
    const status = (searchParams.get('status') || '').trim().toLowerCase()

    // Build filters
    const andFilters: any[] = []
    if (q) {
      andFilters.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      })
    }
    if (status) {
      if (status === 'active') andFilters.push({ Order: { some: {} } })
      else if (status === 'inactive') andFilters.push({ Order: { none: {} } })
      else if (status === 'pending') {
        // Example: users with no books and no recipes and no orders
        andFilters.push({ AND: [{ Order: { none: {} } }, { books: { none: {} } }, { recipes: { none: {} } }] })
      }
    }
    const where = andFilters.length ? { AND: andFilters } : undefined

    const [users, totalCount, usersWithOrdersCount, bookCreatorsCount, recipeCreatorsCount] = await Promise.all([
      prisma.user.findMany({
        where,
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
      prisma.user.count({ where }),
      prisma.user.count({ where: { Order: { some: {} } } }),
      prisma.user.count({ where: { books: { some: {} } } }),
      prisma.user.count({ where: { recipes: { some: {} } } })
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
        usersWithOrders: usersWithOrdersCount,
        bookCreators: bookCreatorsCount,
        recipeCreators: recipeCreatorsCount
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
