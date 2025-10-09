'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Users, ChefHat, Calendar, Share2, Copy, BookOpen } from 'lucide-react'
import { Recipe } from '@/types'
import { apiClient } from '@/lib/api'
import Image from 'next/image'

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export default function RecipeDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { id } = params
    
    const [recipe, setRecipe] = useState<Recipe | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchRecipeDetails()
        }
    }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchRecipeDetails = async () => {
        try {
            setLoading(true)
            
            // Fetch recipe data
            const recipeResponse = await apiClient.getRecipe(id as string)
            
            // Extract recipe data (handle both wrapped and direct responses)
            let recipeData: Recipe
            if (typeof recipeResponse === 'object' && recipeResponse !== null) {
                if ('recipe' in recipeResponse && recipeResponse.recipe) {
                    recipeData = recipeResponse.recipe as Recipe
                } else if ('id' in recipeResponse) {
                    recipeData = recipeResponse as Recipe
                } else {
                    console.error('Invalid recipe response structure:', recipeResponse)
                    throw new Error('Invalid recipe response structure')
                }
            } else {
                console.error('Invalid recipe response type:', typeof recipeResponse)
                throw new Error('Invalid recipe response format')
            }
            
            console.log('Final recipe data:', recipeData)
            
            // Validate that we have the required data
            if (!recipeData || !recipeData.title) {
                console.error('Recipe data is missing required information:', recipeData)
                throw new Error('Recipe data is missing required information')
            }
            
            setRecipe(recipeData)
            
        } catch (error) {
            console.error('Failed to fetch recipe details:', error)
            // Set a default recipe object to prevent the page from crashing
            setRecipe({
                id: id as string,
                title: 'Error Loading Recipe',
                description: 'Failed to load recipe details',
                ingredients: [],
                dietTypes: [],
                isShared: false,
                isCopied: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: {
                    id: 'unknown',
                    name: 'Unknown Author',
                    email: 'unknown@example.com'
                }
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteRecipe = async () => {
        if (!recipe) return
        
        if (confirm(`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`)) {
            try {
                await apiClient.deleteRecipe(recipe.id)
                router.push('/recipes')
            } catch (error) {
                console.error('Failed to delete recipe:', error)
                alert('Failed to delete recipe. Please try again.')
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!recipe) {
        return (
            <div className="text-center py-12">
                <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Recipe not found</h2>
                <p className="text-gray-600 mb-4">The recipe you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
                <button
                    onClick={() => router.push('/recipes')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Back to Recipes
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push('/recipes')}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Recipes</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
                        <p className="text-gray-600">Created on {formatDate(recipe.createdAt)}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleDeleteRecipe}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recipe Image */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center overflow-hidden">
                            {recipe.image ? (
                                <Image
                                    src={recipe.image}
                                    alt={recipe.title}
                                    width={800}
                                    height={450}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ChefHat className="w-16 h-16 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* Recipe Details */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Recipe Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Meal Type</p>
                                    <p className="text-lg font-semibold text-gray-900">{recipe.mealType || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Cooking Time</p>
                                    <p className="text-lg font-semibold text-gray-900">{recipe.cookingTime || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Serves</p>
                                    <p className="text-lg font-semibold text-gray-900">{recipe.feeds || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Shared</p>
                                    <p className="text-lg font-semibold text-gray-900">{recipe.isShared ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Created At</p>
                                <p className="text-lg font-semibold text-gray-900">{formatDate(recipe.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {recipe.description && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Ingredients */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
                        </div>
                        <div className="p-6">
                            {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                <ul className="space-y-2">
                                    {recipe.ingredients.map((ingredient, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <span className="text-gray-700">{ingredient}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">No ingredients listed</p>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    {recipe.instructions && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
                            </div>
                            <div className="p-6">
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{recipe.instructions}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Author Information */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Author Information</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center space-x-3">
                                <Users className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{recipe.author?.name || 'Unknown Author'}</p>
                                    <p className="text-xs text-gray-500">Author Name</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{recipe.author?.email || 'No email'}</p>
                                    <p className="text-xs text-gray-500">Email Address</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipe Settings */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Recipe Settings</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center space-x-3">
                                <Share2 className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{recipe.isShared ? 'Shared' : 'Private'}</p>
                                    <p className="text-xs text-gray-500">Visibility</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Copy className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{recipe.isCopied ? 'Copied Recipe' : 'Original Recipe'}</p>
                                    <p className="text-xs text-gray-500">Recipe Type</p>
                                </div>
                            </div>
                            {recipe.book && (
                                <div className="flex items-center space-x-3">
                                    <BookOpen className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{recipe.book.title}</p>
                                        <p className="text-xs text-gray-500">From Book</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                                <Share2 className="w-4 h-4" />
                                <span>Share Recipe</span>
                            </button>
                            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                                <Copy className="w-4 h-4" />
                                <span>Copy Recipe</span>
                            </button>
                            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                                <ChefHat className="w-4 h-4" />
                                <span>View Analytics</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
