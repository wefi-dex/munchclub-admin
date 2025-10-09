import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Starting recipes API request')
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    console.log('Fetching recipes with params:', { page, limit, skip })

    const [recipes, totalCount] = await Promise.all([
      prisma.recipe.findMany({
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
          book: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.recipe.count()
    ])

    console.log('Recipes fetched successfully:', recipes.length)

    const transformedRecipes = recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      feeds: recipe.feeds,
      mealType: recipe.mealType,
      cookingTime: recipe.cookingTime,
      difficulty: 'easy',
      ingredients: recipe.ingredients,
      dietTypes: recipe.dietTypes,
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
    }))

    return NextResponse.json({
      recipes: transformedRecipes,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      },
      stats: {
        totalRecipes: totalCount,
        sharedRecipes: transformedRecipes.filter(recipe => recipe.isShared).length,
        copiedRecipes: transformedRecipes.filter(recipe => recipe.isCopied).length,
        recipesWithImages: transformedRecipes.filter(recipe => recipe.image).length
      }
    })
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}
