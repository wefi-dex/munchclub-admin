'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Eye, BookOpen, ChefHat, Users, TrendingUp, FileText } from 'lucide-react'
import { Book, Recipe } from '@/types'
import { apiClient } from '@/lib/api'
import BookEditModal from '@/components/BookEditModal'

export default function BookDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { id } = params
    
    const [book, setBook] = useState<Book | null>(null)
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [editModalOpen, setEditModalOpen] = useState(false)

    useEffect(() => {
        if (id) {
            fetchBookDetails()
        }
    }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

    // Debug effect to monitor book state changes
    useEffect(() => {
        if (book && Object.keys(book).length === 0) {
            console.error('Book state is empty object!')
        }
    }, [book])

    const fetchBookDetails = async () => {
        try {
            setLoading(true)
            
            // Fetch book data (which already includes recipes)
            const bookResponse = await apiClient.getBook(id as string)

            // Extract book data (handle both wrapped and direct responses)
            let bookData: Book
            if (typeof bookResponse === 'object' && bookResponse !== null) {
                if ('book' in bookResponse && bookResponse.book) {
                    bookData = bookResponse.book as Book
                } else if ('id' in bookResponse) {
                    bookData = bookResponse as Book
                } else {
                    console.error('Invalid book response structure:', bookResponse)
                    throw new Error('Invalid book response structure')
                }
            } else {
                console.error('Invalid book response type:', typeof bookResponse)
                throw new Error('Invalid book response format')
            }
            
            // Validate that we have the required author data
            if (!bookData || !bookData.author || !bookData.author.name) {
                console.error('Book data is missing author information:', bookData)
                throw new Error('Book data is missing author information')
            }
            
            // Additional validation to prevent empty objects
            if (Object.keys(bookData).length === 0) {
                console.error('Book data is empty object:', bookData)
                throw new Error('Book data is empty')
            }
            
            setBook(bookData)
            
            // Extract recipes from the book response
            const bookRecipes = (bookData as Book & { recipes?: Recipe[] }).recipes || []
            setRecipes(bookRecipes)
            
        } catch (error) {
            console.error('Failed to fetch book details:', error)
            // Set a default book object to prevent the page from crashing
            setBook({
                id: id as string,
                title: 'Error Loading Book',
                description: 'Failed to load book details',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: {
                    id: 'unknown',
                    name: 'Unknown Author',
                    email: 'unknown@example.com'
                },
                recipeCount: 0,
                orderCount: 0,
                recipes: []
            })
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

    // Additional safety check for author data
    if (!book.author) {
        console.error('Book author data is missing:', book)
        return (
            <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Book data incomplete</h2>
                <p className="text-gray-600 mb-4">The book data is missing author information.</p>
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
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Books</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                        <p className="text-gray-600">Placed on {formatDate(book.createdAt)}</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Book Details */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Book Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="text-gray-900">{formatDate(book.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="text-gray-900">{book.description || 'No description provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Dedication</label>
                                    <p className="text-gray-900">{book.dedication || 'No dedication'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Dedication Image</label>
                                    {book.dedicationImage ? (
                                        <div className="mt-2">
                                            <img 
                                                src={book.dedicationImage} 
                                                alt="Dedication" 
                                                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No dedication image</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Cover Color</label>
                                    <div className="flex items-center space-x-2">
                                        <div 
                                            className="w-6 h-6 rounded border border-gray-300"
                                            style={{ backgroundColor: book.coverColor ? `#${book.coverColor}` : '#f3f4f6' }}
                                        ></div>
                                        <span className="text-gray-900">{book.coverColor || 'Default'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Total Recipes</label>
                                    <p className="text-2xl font-bold text-gray-900">{book.recipeCount}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">In Baskets</label>
                                    <p className="text-2xl font-bold text-gray-900">{book.orderCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipes */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Recipes</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <span>Meal Type</span>
                                        <span>Cooking Time</span>
                                        <span>Is Shared</span>
                                    </div>
                                    <button className="text-sm text-gray-500 hover:text-gray-700">
                                        Columns
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            {recipes.length === 0 ? (
                                <div className="text-center py-8">
                                    <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No results.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Meal Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Cooking Time
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Serves
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Shared
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Created At
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {recipes.map((recipe) => (
                                                <tr key={recipe.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{recipe.title}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {recipe.mealType || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {recipe.cookingTime || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {recipe.feeds || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                                            recipe.isShared ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {recipe.isShared ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(recipe.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            
                            {/* Pagination */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    {recipes.length} of {recipes.length} row(s) selected.
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span>Rows per page</span>
                                    <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-500">
                                Page 1 of {Math.ceil(recipes.length / 10)}
                            </div>
                        </div>
                    </div>
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
                                    <p className="text-sm font-medium text-gray-900">{book.author?.name || 'Unknown Author'}</p>
                                    <p className="text-xs text-gray-500">Author Name</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{book.author?.email || 'No email'}</p>
                                    <p className="text-xs text-gray-500">Email Address</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Book Settings */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Book Settings</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center space-x-3">
                                <BookOpen className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{book.type || 'Standard'}</p>
                                    <p className="text-xs text-gray-500">Book Type</p>
                                </div>
                            </div>
                            {book.chefName && (
                                <div className="flex items-center space-x-3">
                                    <ChefHat className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{book.chefName}</p>
                                        <p className="text-xs text-gray-500">Chef Name</p>
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
                            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Eye className="w-4 h-4" />
                                <span>Preview Book</span>
                            </button>
                            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <FileText className="w-4 h-4" />
                                <span>Export PDF</span>
                            </button>
                            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                <TrendingUp className="w-4 h-4" />
                                <span>View Analytics</span>
                            </button>
                        </div>
                    </div>
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
