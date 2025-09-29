'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Filter, Edit, Trash2, Eye, ChefHat, Clock, Users } from 'lucide-react'
import { Recipe } from '@/types'

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setRecipes([
                {
                    id: '1',
                    title: 'Chocolate Chip Cookies',
                    description: 'Classic homemade chocolate chip cookies',
                    ingredients: ['flour', 'butter', 'sugar', 'chocolate chips', 'eggs'],
                    instructions: ['Mix dry ingredients', 'Cream butter and sugar', 'Add eggs', 'Bake at 350°F'],
                    prepTime: 15,
                    cookTime: 12,
                    servings: 24,
                    difficulty: 'easy',
                    category: 'Desserts',
                    image: '/api/placeholder/300/200',
                    author: 'Chef Master',
                    createdAt: '2024-01-20',
                    status: 'published'
                },
                {
                    id: '2',
                    title: 'Beef Stir Fry',
                    description: 'Quick and healthy beef stir fry',
                    ingredients: ['beef', 'vegetables', 'soy sauce', 'garlic', 'ginger'],
                    instructions: ['Slice beef thinly', 'Heat oil in wok', 'Cook beef', 'Add vegetables', 'Season'],
                    prepTime: 20,
                    cookTime: 10,
                    servings: 4,
                    difficulty: 'medium',
                    category: 'Main Course',
                    image: '/api/placeholder/300/200',
                    author: 'Nutrition Expert',
                    createdAt: '2024-01-18',
                    status: 'published'
                }
            ])
            setLoading(false)
        }, 1000)
    }, [])

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'hard': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
                    <p className="text-gray-600">Manage recipe collection and content</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Recipe</span>
                </button>
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
                    <div key={recipe.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                            {recipe.image ? (
                                <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover rounded-t-lg"
                                />
                            ) : (
                                <ChefHat className="w-16 h-16 text-gray-400" />
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 truncate flex-1">{recipe.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                                    {recipe.difficulty}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>

                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {recipe.prepTime + recipe.cookTime} min
                                </div>
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    {recipe.servings} servings
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-500">By {recipe.author}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${recipe.status === 'published'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {recipe.status}
                                </span>
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
                ))}
            </div>
        </div>
    )
}



