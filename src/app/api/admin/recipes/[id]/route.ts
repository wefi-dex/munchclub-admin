import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recipeId } = await params

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    const recipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        book: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    const transformedRecipe = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      feeds: recipe.feeds,
      mealType: recipe.mealType,
      cookingTime: recipe.cookingTime,
      difficulty: 'easy',
      ingredients: recipe.ingredients || [],
      dietTypes: recipe.dietTypes || [],
      instructions: recipe.instruction || '',
      isShared: recipe.isShared,
      isCopied: recipe.isCopied,
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
      author: recipe.user ? {
        id: recipe.user.id,
        name: recipe.user.name,
        email: recipe.user.email
      } : {
        id: 'unknown',
        name: 'Unknown User',
        email: 'unknown@example.com'
      },
      book: recipe.book ? {
        id: recipe.book.id,
        title: recipe.book.title
      } : undefined
    }

    return NextResponse.json({ recipe: transformedRecipe })
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recipeId } = await params
    const body = await request.json()
    
    const recipe = await prisma.recipe.update({
      where: {
        id: recipeId
      },
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        feeds: body.feeds,
        mealType: body.mealType,
        cookingTime: body.cookingTime,
        ingredients: body.ingredients,
        dietTypes: body.dietTypes,
        instruction: body.instructions,
        isShared: body.isShared
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        book: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    const transformedRecipe = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      feeds: recipe.feeds,
      mealType: recipe.mealType,
      cookingTime: recipe.cookingTime,
      difficulty: 'easy',
      ingredients: recipe.ingredients || [],
      dietTypes: recipe.dietTypes || [],
      instructions: recipe.instruction || '',
      isShared: recipe.isShared,
      isCopied: recipe.isCopied,
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
      author: recipe.user ? {
        id: recipe.user.id,
        name: recipe.user.name,
        email: recipe.user.email
      } : {
        id: 'unknown',
        name: 'Unknown User',
        email: 'unknown@example.com'
      },
      book: recipe.book ? {
        id: recipe.book.id,
        title: recipe.book.title
      } : undefined
    }

    return NextResponse.json({ recipe: transformedRecipe })
  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recipeId } = await params
    await prisma.recipe.delete({
      where: {
        id: recipeId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}
