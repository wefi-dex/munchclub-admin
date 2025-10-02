import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await prisma.book.findUnique({
      where: {
        id: params.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipes: {
          select: {
            id: true,
            title: true,
            image: true,
            mealType: true,
            cookingTime: true
          }
        },
        BasketItem: {
          select: {
            id: true
          }
        }
      }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    const transformedBook = {
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
        id: book.user.id,
        name: book.user.name,
        email: book.user.email
      },
      recipeCount: book.recipes.length,
      orderCount: book.BasketItem.length,
      recipes: book.recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        mealType: recipe.mealType,
        cookingTime: recipe.cookingTime,
        difficulty: 'easy'
      }))
    }

    return NextResponse.json({ book: transformedBook })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const book = await prisma.book.update({
      where: {
        id: params.id
      },
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        coverColor: body.coverColor,
        chefName: body.chefName,
        type: body.type
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
    console.error('Error updating book:', error)
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.book.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    )
  }
}
