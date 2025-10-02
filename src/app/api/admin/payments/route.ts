import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: limit,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.payment.count()
    ])

    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      stripePaymentId: payment.stripePaymentId,
      amount: payment.amount,
      status: payment.paymentStatus,
      createdAt: payment.createdAt.toISOString(),
      order: {
        id: payment.order.id,
        status: payment.order.orderStatus,
        createdAt: payment.order.createdAt.toISOString(),
        customer: {
          id: payment.order.user.id,
          name: payment.order.user.name,
          email: payment.order.user.email
        }
      }
    }))

    return NextResponse.json({
      payments: transformedPayments,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      },
      stats: {
        totalPayments: totalCount,
        totalAmount: transformedPayments.reduce((sum, payment) => sum + payment.amount, 0),
        successfulPayments: transformedPayments.filter(payment => payment.status === 'SUCCESSFUL').length,
        failedPayments: transformedPayments.filter(payment => payment.status === 'FAILED').length
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
