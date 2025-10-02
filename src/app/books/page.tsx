'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Eye, BookOpen, RefreshCw, ChefHat, Users, TrendingUp } from 'lucide-react'
import { Book } from '@/types'
import { apiClient } from '@/lib/api'
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

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const [selectedBooks, setSelectedBooks] = useState<string[]>([])
    const [filterType, setFilterType] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Stats state
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalRecipes: 0,
        totalOrders: 0,
        premiumBooks: 0
    })

    const fetchBooks = async (isRefresh = false) => {

        setBooks([])
        setLoading(false)
        // Set default stats when API fails
        setStats({
            totalBooks: 0,
            totalRecipes: 0,
            totalOrders: 0,
            premiumBooks: 0
        })
        return
        
        try {
            if (isRefresh) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }
            const response = await apiClient.getBooks()
            const booksData = Array.isArray(response) ? response : (response as { books?: Book[] }).books || []
            setBooks(booksData)
            const calculatedStats = {
                totalBooks: booksData.length,
                totalRecipes: booksData.reduce((sum: number, book: Book) => sum + (book.recipeCount || 0), 0),
                totalOrders: booksData.reduce((sum: number, book: Book) => sum + (book.orderCount || 0), 0),
                premiumBooks: booksData.filter((book: Book) => book.type === 'premium' || book.type === 'deluxe').length
            }
            setStats(calculatedStats)
        } catch (error) {
            console.error('Failed to fetch books:', error)
            setBooks([])
            // Set default stats when API fails
            setStats({
                totalBooks: 0,
                totalRecipes: 0,
                totalOrders: 0,
                premiumBooks: 0
            })
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchBooks()
    }, [])

    const filteredAndSortedBooks = books
        .filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.chefName?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesFilter = filterType === 'all' || book.type === filterType

            return matchesSearch && matchesFilter
        })
        .sort((a, b) => {
            let aValue: string | number, bValue: string | number

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase()
                    bValue = b.title.toLowerCase()
                    break
                case 'author':
                    aValue = a.author.name.toLowerCase()
                    bValue = b.author.name.toLowerCase()
                    break
                case 'recipes':
                    aValue = a.recipeCount
                    bValue = b.recipeCount
                    break
                case 'orders':
                    aValue = a.orderCount
                    bValue = b.orderCount
                    break
                default:
                    aValue = new Date(a.createdAt).getTime()
                    bValue = new Date(b.createdAt).getTime()
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

    const handleDeleteBook = async (bookId: string) => {
        const book = books.find(b => b.id === bookId)
        if (!book) return

        if (confirm(`Are you sure you want to delete "${book.title}"? This action cannot be undone.`)) {
            try {
                await apiClient.deleteBook(bookId)
                await fetchBooks(true) // Refresh the list
            } catch (error) {
                console.error('Failed to delete book:', error)
                alert('Failed to delete book. Please try again.')
            }
        }
    }

    const handleSelectBook = (bookId: string) => {
        setSelectedBooks(prev =>
            prev.includes(bookId)
                ? prev.filter(id => id !== bookId)
                : [...prev, bookId]
        )
    }

    const handleSelectAll = () => {
        if (selectedBooks.length === filteredAndSortedBooks.length) {
            setSelectedBooks([])
        } else {
            setSelectedBooks(filteredAndSortedBooks.map(book => book.id))
        }
    }

    const handleBulkDelete = async () => {
        if (selectedBooks.length === 0) return

        if (confirm(`Are you sure you want to delete ${selectedBooks.length} book(s)? This action cannot be undone.`)) {
            try {
                await Promise.all(selectedBooks.map(id => apiClient.deleteBook(id)))
                setSelectedBooks([])
                await fetchBooks(true)
            } catch (error) {
                console.error('Failed to delete books:', error)
                alert('Failed to delete some books. Please try again.')
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Books</h1>
                    <p className="text-slate-600 mt-1">Manage book catalog and inventory</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => fetchBooks(true)}
                        disabled={refreshing}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Book</span>
                    </button>
                </div>
            </div>

            {/* Book Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card-modern p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Books</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalBooks}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="card-modern p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Recipes</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalRecipes}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100">
                            <ChefHat className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="card-modern p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Orders</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="card-modern p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Premium Books</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.premiumBooks}</p>
                        </div>
                        <div className="p-3 rounded-full bg-orange-100">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card-modern p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search books..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="deluxe">Deluxe</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="createdAt">Date Created</option>
                            <option value="title">Title</option>
                            <option value="author">Author</option>
                            <option value="recipes">Recipe Count</option>
                            <option value="orders">Order Count</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedBooks.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-blue-900">
                                {selectedBooks.length} book(s) selected
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                                Delete Selected
                            </button>
                        </div>
                        <button
                            onClick={() => setSelectedBooks([])}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {/* Books Grid */}
            <div className="space-y-4">
                {filteredAndSortedBooks.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                    </div>
                ) : (
                    <>
                        {/* Select All */}
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                checked={selectedBooks.length === filteredAndSortedBooks.length && filteredAndSortedBooks.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Select all ({filteredAndSortedBooks.length} books)
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAndSortedBooks.map((book) => (
                                <div key={book.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                                    {/* Selection Checkbox */}
                                    <div className="p-3 border-b border-gray-100">
                                        <input
                                            type="checkbox"
                                            checked={selectedBooks.includes(book.id)}
                                            onChange={() => handleSelectBook(book.id)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="aspect-[3/4] rounded-t-lg overflow-hidden">
                                        <Image
                                 src={(() => {
                                     const imageUrl = book.image && book.image.trim() ? book.image : getDefaultBookImage(book.id)
                                     // Simple validation - check if it's a valid URL or relative path
                                     if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('./'))) {
                                         return imageUrl
                                     }
                                     return getDefaultBookImage(book.id)
                                 })()}
                                            alt={book.title || 'Book cover'}
                                            width={300}
                                            height={400}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback to default image if the original image fails to load
                                                const target = e.target as HTMLImageElement
                                                target.src = getDefaultBookImage(book.id)
                                            }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                                        <p className="text-sm text-gray-600 truncate">By {book.author.name}</p>
                                        {book.chefName && (
                                            <p className="text-sm text-gray-500 truncate">Chef: {book.chefName}</p>
                                        )}
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm text-gray-500">{book.type}</span>
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">
                                            <p>Recipes: {book.recipeCount}</p>
                                            <p>Orders: {book.orderCount}</p>
                                        </div>
                                        <div className="mt-4 flex space-x-2">
                                            <button
                                                onClick={() => window.location.href = `/books/${book.id}`}
                                                className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 flex items-center justify-center"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => window.location.href = `/books/${book.id}`}
                                                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBook(book.id)}
                                                className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}







