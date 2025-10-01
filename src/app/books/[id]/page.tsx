'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Eye, BookOpen, ChefHat, Clock, Users, TrendingUp, Calendar } from 'lucide-react'
import { Book, Recipe } from '@/types'
import { apiClient } from '@/lib/api'
import BookEditModal from '@/components/BookEditModal'
import Image from 'next/image'

// Function to get default book image
const getDefaultBookImage = (bookId: string | undefined) => {
    const defaultImages = [
        '/assets/images/book-default1.jpg',
        '/assets/images/book-default2.jpg',
        '/assets/images/book-default3.jpg'
    ]
    // Use book ID to consistently select the same default image for the same book
    if (!bookId) return defaultImages[0]
    const index = bookId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % defaultImages.length
    return defaultImages[index]
}

export default function BookDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { id } = params
    
    const [book, setBook] = useState<Book | null>(null)
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'analytics'>('overview')
    const [editModalOpen, setEditModalOpen] = useState(false)

    useEffect(() => {
        if (id) {
            fetchBookDetails()
        }
    }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchBookDetails = async () => {
        try {
            setLoading(true)
            const [bookResponse, recipesResponse] = await Promise.all([
                apiClient.getBook(id as string),
                apiClient.getRecipes(1, 100) // Get all recipes for this book
            ])
            
            setBook((bookResponse as any).book || bookResponse)
            // Filter recipes for this book
            const bookRecipes = (recipesResponse as any).recipes?.filter((recipe: Recipe) => 
                recipe.book?.id === id
            ) || []
            setRecipes(bookRecipes)
        } catch (error) {
            console.error('Failed to fetch book details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteBook = async () => {
        if (!book) return
        
        if (confirm(`Are you sure you want to delete "${book.title}"? This action cannot be undone.`)) {
            try {
                await apiClient.deleteBook(book.id)
                router.push('/books')
            } catch (error) {
                console.error('Failed to delete book:', error)
                alert('Failed to delete book. Please try again.')
            }
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!book) {
        return (
            <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Book not found</h2>
                <p className="text-gray-600 mb-4">The book you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
                <button
                    onClick={() => router.push('/books')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Back to Books
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
                        onClick={() => router.push('/books')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                        <p className="text-gray-600">Book Details & Management</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => setEditModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit Book</span>
                    </button>
                    <button
                        onClick={handleDeleteBook}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            {/* Book Overview Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Book Cover */}
                    <div className="lg:col-span-1">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={(() => {
                                    const imageUrl = book.image && book.image.trim() ? book.image : getDefaultBookImage(book.id)
                                    // Simple validation - check if it's a valid URL or relative path
                                    if (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('./')) {
                                        return imageUrl
                                    }
                                    return getDefaultBookImage(book.id)
                                })()}
                                alt={book.title || 'Book cover'}
                                width={400}
                                height={533}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Fallback to default image if the original image fails to load
                                    const target = e.target as HTMLImageElement
                                    target.src = getDefaultBookImage(book.id)
                                }}
                            />
                        </div>
                    </div>

                    {/* Book Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Book Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Title</label>
                                    <p className="text-gray-900">{book.title}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Author</label>
                                    <p className="text-gray-900">{book.author.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Chef Name</label>
                                    <p className="text-gray-900">{book.chefName || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Type</label>
                                    <p className="text-gray-900">{book.type || 'Standard'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created</label>
                                    <p className="text-gray-900">{formatDate(book.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                    <p className="text-gray-900">{formatDate(book.updatedAt)}</p>
                                </div>
                            </div>
                            {book.description && (
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="text-gray-900 mt-1">{book.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <ChefHat className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-blue-900">{book.recipeCount}</p>
                                <p className="text-sm text-blue-700">Recipes</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-900">{book.orderCount}</p>
                                <p className="text-sm text-green-700">Orders</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg text-center">
                                <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-purple-900">$0</p>
                                <p className="text-sm text-purple-700">Revenue</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg text-center">
                                <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-orange-900">0</p>
                                <p className="text-sm text-orange-700">Views</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Overview', icon: Eye },
                            { id: 'recipes', label: 'Recipes', icon: ChefHat },
                            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'overview' | 'recipes' | 'analytics')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Book created</p>
                                            <p className="text-xs text-gray-500">{formatDate(book.createdAt)}</p>
                                        </div>
                                    </div>
                                    {book.updatedAt !== book.createdAt && (
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <Edit className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Last updated</p>
                                                <p className="text-xs text-gray-500">{formatDate(book.updatedAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'recipes' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Recipes ({recipes.length})</h3>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                    Add Recipe
                                </button>
                            </div>
                            
                            {recipes.length === 0 ? (
                                <div className="text-center py-8">
                                    <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No recipes found for this book.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recipes.map((recipe) => (
                                        <div key={recipe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 truncate">{recipe.title}</h4>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {recipe.image && recipe.image.trim() && (
                                                <div className="aspect-video bg-gray-200 rounded mb-3 overflow-hidden">
                                                    <Image
                                                        src={recipe.image}
                                                        alt={recipe.title}
                                                        width={300}
                                                        height={169}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="space-y-1 text-sm text-gray-600">
                                                {recipe.mealType && (
                                                    <div className="flex items-center space-x-2">
                                                        <ChefHat className="w-4 h-4" />
                                                        <span>{recipe.mealType}</span>
                                                    </div>
                                                )}
                                                {recipe.cookingTime && (
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{recipe.cookingTime} mins</span>
                                                    </div>
                                                )}
                                                {recipe.feeds && (
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4" />
                                                        <span>Serves {recipe.feeds}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Book Analytics</h3>
                            <div className="text-center py-8">
                                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Analytics data will be available soon.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <BookEditModal
                book={book}
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={(updatedBook) => {
                    setBook(updatedBook)
                    setEditModalOpen(false)
                }}
            />
        </div>
    )
}
