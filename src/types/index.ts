export interface OrderItem {
    id: string
    productId: string
    productName: string
    quantity: number
    price: number
    pages?: number
    recipes?: number
    type?: string
    coverUrl?: string
    contentUrl?: string
    jobReference?: string
}

export interface ShippingAddress {
    firstName?: string
    lastName?: string
    addressLine1?: string
    addressLine2?: string
    town?: string
    county?: string
    postCode?: string
    country?: string
    // Legacy fields for backward compatibility
    street?: string
    city?: string
    state?: string
    zipCode?: string
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
    updatedAt?: string
    shippingAddress: ShippingAddress
    payment?: {
        id: string
        status: string
        amount: number
        stripePaymentId?: string
    }
    // Printer integration fields
    printerOrderIds?: string[]
    printerStatus?: string
    trackingNumber?: string
    estimatedDelivery?: string
    printerErrorMessage?: string
    // Order status history
    orderStatusHistory?: Array<{
        status: string
        timestamp: string
        note?: string
    }>
    // Additional order details
    messages?: Array<{
        type: string
        content?: string
        timestamp: string
        fileUrls?: Array<{
            cover?: string
            text?: string
            coverUrl?: string
            textUrl?: string
        }> | any
    }>
    purchasedBooks?: any
    isMultipleAddress?: boolean
    summary?: {
        totalItems: number
        totalQuantity: number
        totalRecipes: number
        totalPages: number
    }
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
    dedication?: string
    dedicationImage?: string
    createdAt: string
    updatedAt: string
    author: {
        id: string
        name: string
        email: string
    }
    recipeCount: number
    orderCount: number
    recipes?: Recipe[]
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
    instructions?: string
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
