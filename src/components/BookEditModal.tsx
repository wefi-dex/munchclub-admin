'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { Book } from '@/types'
import { apiClient } from '@/lib/api'

interface BookEditModalProps {
    book: Book | null
    isOpen: boolean
    onClose: () => void
    onSave: (book: Book) => void
}

export default function BookEditModal({ book, isOpen, onClose, onSave }: BookEditModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        chefName: '',
        type: 'standard',
        coverColor: '#2744a4',
        dedication: '',
        dedicationImage: ''
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (book && isOpen) {
            setFormData({
                title: book.title || '',
                description: book.description || '',
                chefName: book.chefName || '',
                type: book.type || 'standard',
                coverColor: book.coverColor || '#2744a4',
                dedication: book.dedication || '',
                dedicationImage: book.dedicationImage || ''
            })
        }
    }, [book, isOpen])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }
        
        if (formData.title.length > 100) {
            newErrors.title = 'Title must be less than 100 characters'
        }
        
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters'
        }
        
        if (formData.chefName && formData.chefName.length > 50) {
            newErrors.chefName = 'Chef name must be less than 50 characters'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm() || !book) return
        
        setLoading(true)
        try {
            const response = await apiClient.updateBook(book.id, formData)            
            // Extract the book data from the response
            const updatedBook = (response as { book: Book }).book || response as Book
            
            onSave(updatedBook)
            onClose()
        } catch (error) {
            console.error('Failed to update book:', error)
            alert('Failed to update book. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    if (!isOpen || !book) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Book</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Book Cover Preview */}
                    <div className="flex items-center space-x-4">
                        <div 
                            className="w-24 h-32 rounded-lg flex flex-col items-center justify-center text-white font-bold text-sm shadow-lg"
                            style={{ backgroundColor: formData.coverColor }}
                        >
                            <span className="text-xs opacity-80 mb-1">PREVIEW</span>
                            <span className="text-lg font-bold">
                                {formData.title.slice(0, 2).toUpperCase()}
                            </span>
                            {formData.chefName && (
                                <span className="text-xs opacity-75 mt-1">
                                    by {formData.chefName.slice(0, 8)}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Cover Preview</p>
                            <p className="text-xs text-gray-500">Color will be applied to book cover</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.title ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter book title"
                            maxLength={100}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.title.length}/100 characters
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.description ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter book description"
                            rows={4}
                            maxLength={500}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.description.length}/500 characters
                        </p>
                    </div>

                    {/* Chef Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chef Name
                        </label>
                        <input
                            type="text"
                            value={formData.chefName}
                            onChange={(e) => handleInputChange('chefName', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.chefName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter chef name"
                            maxLength={50}
                        />
                        {errors.chefName && (
                            <p className="mt-1 text-sm text-red-600">{errors.chefName}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.chefName.length}/50 characters
                        </p>
                    </div>

                    {/* Dedication */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dedication
                        </label>
                        <textarea
                            value={formData.dedication}
                            onChange={(e) => handleInputChange('dedication', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter dedication text"
                            rows={3}
                            maxLength={98}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.dedication.length}/98 characters
                        </p>
                    </div>

                    {/* Dedication Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dedication Image
                        </label>
                        <div className="flex items-center space-x-4">
                            {formData.dedicationImage ? (
                                <div className="flex-shrink-0">
                                    <img 
                                        src={formData.dedicationImage} 
                                        alt="Dedication" 
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">No image</span>
                                </div>
                            )}
                            <div className="flex-1">
                                <input
                                    type="url"
                                    value={formData.dedicationImage}
                                    onChange={(e) => handleInputChange('dedicationImage', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter image URL"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Enter a URL for the dedication image
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Book Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Book Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="deluxe">Deluxe</option>
                        </select>
                    </div>

                    {/* Cover Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Color
                        </label>
                        <div className="flex items-center space-x-3">
                            <input
                                type="color"
                                value={formData.coverColor}
                                onChange={(e) => handleInputChange('coverColor', e.target.value)}
                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.coverColor}
                                onChange={(e) => handleInputChange('coverColor', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="#2744a4"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Choose a color for your book cover
                        </p>
                    </div>

                    {/* Author Info (Read-only) */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Author Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Name:</span>
                                <span className="ml-2 text-gray-900">{book.author.name}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Email:</span>
                                <span className="ml-2 text-gray-900">{book.author.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
