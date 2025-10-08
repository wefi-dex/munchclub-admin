export interface OrderItem {
    id: string
    productId: string
    productName: string
    quantity: number
    price: number
}

export interface ShippingAddress {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
}

export interface Order {
    id: string
    userId: string
    userName: string
    userEmail: string
    items: OrderItem[]
    total: number
    status: string
    createdAt: string
    updatedAt: string
    shippingAddress: ShippingAddress
    payment?: {
        id: string
        status: string
        amount: number
    }
    // Printer integration fields
    printerOrderIds?: string[]
    printerStatus?: string
    trackingNumber?: string
    estimatedDelivery?: string
    printerErrorMessage?: string
}

export interface User {
    id: string
    name: string
    email: string
    image?: string
    createdAt: string
    updatedAt: string
    orderCount: number
    bookCount: number
    recipeCount: number
}

export interface Book {
    id: string
    title: string
    description?: string
    image?: string
    coverColor?: string
    chefName?: string
    type?: string
    createdAt: string
    updatedAt: string
    author: {
        id: string
        name: string
        email: string
    }
    recipeCount: number
    orderCount: number
}

export interface Recipe {
    id: string
    title: string
    description?: string
    image?: string
    feeds?: string
    mealType?: string
    cookingTime?: string
    difficulty?: string
    ingredients: string[]
    dietTypes: string[]
    isShared: boolean
    isCopied: boolean
    createdAt: string
    updatedAt: string
    author: {
        id: string
        name: string
        email: string
    }
    book?: {
        id: string
        title: string
    }
}

export interface Payment {
    id: string
    stripePaymentId: string
    amount: number
    status: string
    createdAt: string
    order: {
        id: string
        status: string
        createdAt: string
        customer: {
            id: string
            name: string
            email: string
        }
    }
}
