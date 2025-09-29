'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Filter, Edit, Trash2, Eye, BookOpen } from 'lucide-react'
import { Book } from '@/types'

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setBooks([
                {
                    id: '1',
                    title: 'The Complete Cookbook',
                    author: 'Chef Master',
                    isbn: '978-1234567890',
                    price: 29.99,
                    stock: 150,
                    category: 'Cooking',
                    publishedAt: '2024-01-01',
                    coverImage: '/api/placeholder/200/300',
                    status: 'active'
                },
                {
                    id: '2',
                    title: 'Healthy Recipes Guide',
                    author: 'Nutrition Expert',
                    isbn: '978-0987654321',
                    price: 24.99,
                    stock: 75,
                    category: 'Health',
                    publishedAt: '2024-01-15',
                    coverImage: '/api/placeholder/200/300',
                    status: 'active'
                }
            ])
            setLoading(false)
        }, 1000)
    }, [])

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Books</h1>
                    <p className="text-gray-600">Manage book catalog and inventory</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Book</span>
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row gap-4">
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
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                    <div key={book.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div className="aspect-[3/4] bg-gray-200 rounded-t-lg flex items-center justify-center">
                            {book.coverImage ? (
                                <img
                                    src={book.coverImage}
                                    alt={book.title}
                                    className="w-full h-full object-cover rounded-t-lg"
                                />
                            ) : (
                                <BookOpen className="w-16 h-16 text-gray-400" />
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                            <p className="text-sm text-gray-600 truncate">{book.author}</p>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-lg font-bold text-blue-600">${book.price}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${book.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {book.status}
                                </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                <p>Stock: {book.stock} units</p>
                                <p>ISBN: {book.isbn}</p>
                            </div>
                            <div className="mt-4 flex space-x-2">
                                <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 flex items-center justify-center">
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                </button>
                                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center justify-center">
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                </button>
                                <button className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}



