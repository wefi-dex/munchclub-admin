import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Admin Panel API is working on port 3000!',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/admin/books',
      '/api/admin/users', 
      '/api/admin/orders',
      '/api/admin/recipes',
      '/api/admin/payments',
      '/api/dashboard/stats'
    ]
  })
}
