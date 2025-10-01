'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Filter, Edit, Trash2, Eye, ChefHat, Clock, Users, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Recipe } from '@/types'
import { apiClient } from '@/lib/api'
import Image from 'next/image'

interface RecipeStats {
    totalRecipes: number
    sharedRecipes: number
    breakfastRecipes: number
    lunchRecipes: number
    dinnerRecipes: number
}

const DEFAULT_STATS: RecipeStats = {
    totalRecipes: 0,
    sharedRecipes: 0,
    breakfastRecipes: 0,
    lunchRecipes: 0,
    dinnerRecipes: 0
}

const DIFFICULTY_COLORS = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
} as const

interface RecipeCardProps {
    recipe: Recipe
    getDifficultyColor: (difficulty: string) => string
}

const RecipeCard = ({ recipe, getDifficultyColor }: RecipeCardProps) => (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
        <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center overflow-hidden">
            {recipe.image ? (
                <Image
                    src={recipe.image}
                    alt={recipe.title}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                />
            ) : (
                <ChefHat className="w-16 h-16 text-gray-400" />
            )}
        </div>
        <div className="p-4">
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate flex-1">{recipe.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(recipe.difficulty || 'easy')}`}>
                    {recipe.difficulty || 'Easy'}
                </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                {recipe.cookingTime && (
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {recipe.cookingTime}
                    </div>
                )}
                {recipe.feeds && (
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {recipe.feeds}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">By {recipe.author.name}</span>
                <div className="flex space-x-1">
                    {recipe.isShared && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Shared
                        </span>
                    )}
                    {recipe.isCopied && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            Copied
                        </span>
                    )}
                </div>
            </div>

            <div className="flex space-x-2">
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
)

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
}

const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    totalCount, 
    pageSize, 
    onPageChange, 
    onPageSizeChange 
}: PaginationControlsProps) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
            </div>

            {/* Pagination Info */}
            <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} recipes
            </div>

            {/* Pagination Navigation */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    currentPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
)

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    
    // Stats state
    const [stats, setStats] = useState<RecipeStats>(DEFAULT_STATS)

    const fetchRecipes = useCallback(async (page: number = currentPage, limit: number = pageSize, isRefresh = false) => {

        setRecipes([])
        setLoading(false)
        // Set default stats when API fails
        setStats(DEFAULT_STATS)
        return

        try {
            if (isRefresh) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }
            
            const response = await apiClient.getRecipes(page, limit)
            
            setRecipes((response.recipes as Recipe[]) || [])
            setTotalPages(response.pagination?.totalPages || 1)
            setTotalCount(response.pagination?.totalCount || 0)
            setCurrentPage(response.pagination?.currentPage || 1)
            setStats((response.stats as unknown as RecipeStats) || DEFAULT_STATS)
        } catch (error) {
            console.error('Failed to fetch recipes:', error)
            setRecipes([])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, pageSize])

    useEffect(() => {
        fetchRecipes()
    }, [fetchRecipes])

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
            fetchRecipes(newPage, pageSize)
        }
    }, [totalPages, pageSize, fetchRecipes])

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize)
        setCurrentPage(1)
        fetchRecipes(1, newSize)
    }, [fetchRecipes])

    const handleRefresh = useCallback(() => {
        fetchRecipes(currentPage, pageSize, true)
    }, [currentPage, pageSize, fetchRecipes])

    const filteredRecipes = recipes.filter(recipe => {
        const searchLower = searchTerm.toLowerCase()
        return (
            recipe.title.toLowerCase().includes(searchLower) ||
            recipe.description?.toLowerCase().includes(searchLower) ||
            recipe.mealType?.toLowerCase().includes(searchLower) ||
            recipe.author.name.toLowerCase().includes(searchLower)
        )
    })

    const getDifficultyColor = (difficulty: string) => {
        return DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.default
    }

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
                    <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
                    <p className="text-gray-600">Manage recipe collection and content</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Recipe</span>
                    </button>
                </div>
            </div>

            {/* Recipe Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[
                    { label: 'Total Recipes', value: stats.totalRecipes, icon: ChefHat, color: 'blue' },
                    { label: 'Shared', value: stats.sharedRecipes, icon: Users, color: 'green' },
                    { label: 'Breakfast', value: stats.breakfastRecipes, icon: ChefHat, color: 'yellow' },
                    { label: 'Lunch', value: stats.lunchRecipes, icon: ChefHat, color: 'orange' },
                    { label: 'Dinner', value: stats.dinnerRecipes, icon: ChefHat, color: 'purple' }
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className={`p-2 bg-${color}-100 rounded-lg`}>
                                <Icon className={`w-6 h-6 text-${color}-600`} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{label}</p>
                                <p className="text-2xl font-bold text-gray-900">{value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search recipes..."
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

            {/* Recipes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                    <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        getDifficultyColor={getDifficultyColor}
                    />
                ))}
            </div>

            {/* Pagination Controls */}
            {totalCount > 0 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    )
}







