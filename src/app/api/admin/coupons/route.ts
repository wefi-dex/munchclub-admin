import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getMongoDb } from '@/lib/mongo'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (q) {
      where['$or'] = [
        { couponCode: { $regex: q, $options: 'i' } },
        { purchaserEmail: { $regex: q, $options: 'i' } },
        { recipientEmail: { $regex: q, $options: 'i' } },
        { purchaserName: { $regex: q, $options: 'i' } },
        { recipientName: { $regex: q, $options: 'i' } },
      ]
    }

    const db = await getMongoDb()
    const collection = db.collection('coupons')
    const totalCount = await collection.countDocuments(where)
    const items = await collection
      .find(where)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      data: items,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch coupons'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


