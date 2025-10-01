const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

interface ApiResponse<T> {
    data?: T
    pagination?: {
        totalCount: number
        totalPages: number
        currentPage: number
    }
    stats?: Record<string, number>
}

interface UsersResponse extends ApiResponse<unknown[]> {
    users?: unknown[]
}

interface OrdersResponse extends ApiResponse<unknown[]> {
    orders?: unknown[]
}

interface BooksResponse extends ApiResponse<unknown[]> {
    books?: unknown[]
}

interface RecipesResponse extends ApiResponse<unknown[]> {
    recipes?: unknown[]
}

interface PaymentsResponse extends ApiResponse<unknown[]> {
    payments?: unknown[]
}

class ApiClient {
    private baseUrl: string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        }

        try {
            const response = await fetch(url, config)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error(`API request failed: Unable to connect to ${url}. Make sure the backend server is running.`)
                throw new Error(`Unable to connect to backend API at ${url}. Please ensure the server is running on port 3001.`)
            }
            console.error('API request failed:', error)
            throw error
        }
    }

    // Users API
    async getUsers(page: number = 1, limit: number = 10): Promise<UsersResponse> {
        return this.request(`/admin/users?page=${page}&limit=${limit}`)
    }

    async getUser(id: string): Promise<unknown> {
        return this.request(`/users/${id}`)
    }

    async createUser(user: Record<string, unknown>): Promise<unknown> {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(user),
        })
    }

    async updateUser(id: string, user: Record<string, unknown>): Promise<unknown> {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(user),
        })
    }

    async deleteUser(id: string): Promise<void> {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        })
    }

    // Orders API
    async getOrders(page: number = 1, limit: number = 10): Promise<OrdersResponse> {
        return this.request(`/admin/orders?page=${page}&limit=${limit}`)
    }

    async getOrder(id: string): Promise<unknown> {
        return this.request(`/orders/${id}`)
    }

    async updateOrderStatus(id: string, status: string): Promise<unknown> {
        return this.request(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        })
    }

    // Books API
    async getBooks(): Promise<BooksResponse> {
        return this.request('/admin/books')
    }

    async getBook(id: string): Promise<unknown> {
        return this.request(`/books/${id}`)
    }

    async createBook(book: Record<string, unknown>): Promise<unknown> {
        return this.request('/books', {
            method: 'POST',
            body: JSON.stringify(book),
        })
    }

    async updateBook(id: string, book: Record<string, unknown>): Promise<unknown> {
        return this.request(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(book),
        })
    }

    async deleteBook(id: string): Promise<void> {
        return this.request(`/books/${id}`, {
            method: 'DELETE',
        })
    }

    // Recipes API
    async getRecipes(page: number = 1, limit: number = 10): Promise<RecipesResponse> {
        return this.request(`/admin/recipes?page=${page}&limit=${limit}`)
    }

    async getRecipe(id: string): Promise<unknown> {
        return this.request(`/recipes/${id}`)
    }

    async createRecipe(recipe: Record<string, unknown>): Promise<unknown> {
        return this.request('/recipes', {
            method: 'POST',
            body: JSON.stringify(recipe),
        })
    }

    async updateRecipe(id: string, recipe: Record<string, unknown>): Promise<unknown> {
        return this.request(`/recipes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(recipe),
        })
    }

    async deleteRecipe(id: string): Promise<void> {
        return this.request(`/recipes/${id}`, {
            method: 'DELETE',
        })
    }

    // Payments API
    async getPayments(page: number = 1, limit: number = 10): Promise<PaymentsResponse> {
        return this.request(`/admin/payments?page=${page}&limit=${limit}`)
    }

    async getPayment(id: string): Promise<unknown> {
        return this.request(`/payments/${id}`)
    }

    // Dashboard API
    async getDashboardStats(): Promise<unknown> {
        return this.request('/dashboard/stats')
    }
}

export const apiClient = new ApiClient(API_BASE_URL)







