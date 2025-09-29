const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

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
            console.error('API request failed:', error)
            throw error
        }
    }

    // Users API
    async getUsers(): Promise<any[]> {
        return this.request('/users')
    }

    async getUser(id: string): Promise<any> {
        return this.request(`/users/${id}`)
    }

    async createUser(user: any): Promise<any> {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(user),
        })
    }

    async updateUser(id: string, user: any): Promise<any> {
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
    async getOrders(): Promise<any[]> {
        return this.request('/orders')
    }

    async getOrder(id: string): Promise<any> {
        return this.request(`/orders/${id}`)
    }

    async updateOrderStatus(id: string, status: string): Promise<any> {
        return this.request(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        })
    }

    // Books API
    async getBooks(): Promise<any[]> {
        return this.request('/books')
    }

    async getBook(id: string): Promise<any> {
        return this.request(`/books/${id}`)
    }

    async createBook(book: any): Promise<any> {
        return this.request('/books', {
            method: 'POST',
            body: JSON.stringify(book),
        })
    }

    async updateBook(id: string, book: any): Promise<any> {
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
    async getRecipes(): Promise<any[]> {
        return this.request('/recipes')
    }

    async getRecipe(id: string): Promise<any> {
        return this.request(`/recipes/${id}`)
    }

    async createRecipe(recipe: any): Promise<any> {
        return this.request('/recipes', {
            method: 'POST',
            body: JSON.stringify(recipe),
        })
    }

    async updateRecipe(id: string, recipe: any): Promise<any> {
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
    async getPayments(): Promise<any[]> {
        return this.request('/payments')
    }

    async getPayment(id: string): Promise<any> {
        return this.request(`/payments/${id}`)
    }

    // Dashboard API
    async getDashboardStats(): Promise<any> {
        return this.request('/dashboard/stats')
    }
}

export const apiClient = new ApiClient(API_BASE_URL)



