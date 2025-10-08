import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // First, let's get all books without the user relation to avoid the null user issue
    const books = await prisma.book.findMany({
      include: {
        recipes: {
          select: {
            id: true
          }
        },
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

    // Now let's get user data separately for books that have valid userIds
    const booksWithUsers = await Promise.all(
      books.map(async (book) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: book.userId },
            select: {
              id: true,
              name: true,
              email: true
            }
          })
          return { ...book, user }
        } catch (error) {
          console.error(`Error fetching user for book ${book.id}:`, error)
          return { ...book, user: null }
        }
      })
    )

    // Transform the data to match the expected format
    const transformedBooks = booksWithUsers
      .filter(book => book.user !== null) // Filter out books with null users
      .map(book => ({
        id: book.id,
        title: book.title,
        description: book.description,
        image: book.image,
        coverColor: book.coverColor,
        chefName: book.chefName,
        type: book.type,
        createdAt: book.createdAt.toISOString(),
        updatedAt: book.createdAt.toISOString(),
        author: {
          id: book.user!.id,
          name: book.user!.name,
          email: book.user!.email
        },
        recipeCount: book.recipes.length,
        orderCount: book.BasketItem.length
      }))

    return NextResponse.json({
      books: transformedBooks,
      stats: {
        totalBooks: transformedBooks.length,
        totalRecipes: transformedBooks.reduce((sum, book) => sum + book.recipeCount, 0),
        totalOrders: transformedBooks.reduce((sum, book) => sum + book.orderCount, 0),
        premiumBooks: transformedBooks.filter(book => book.type === 'Premium').length
      }
    })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const book = await prisma.book.create({
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        coverColor: body.coverColor,
        chefName: body.chefName,
        type: body.type || 'Layflat',
        userId: body.userId || 'default-user-id'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    )
  }
}
