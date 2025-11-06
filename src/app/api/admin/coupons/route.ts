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

    // Build query filter
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
    
    // If no search query, use empty object to get all coupons
    const queryFilter = Object.keys(where).length > 0 ? where : {}

    console.log('🔍 Fetching coupons with params:', { q, page, limit, skip })
    
    const db = await getMongoDb()
    console.log('✅ MongoDB connected, database:', db.databaseName)
    
    const collection = db.collection('coupons')
    console.log('✅ Collection accessed: coupons')
    
    // Check if collection exists and has documents
    const collectionExists = await db.listCollections({ name: 'coupons' }).hasNext()
    console.log('📋 Collection exists:', collectionExists)
    
    const totalCount = await collection.countDocuments(queryFilter)
    console.log('📊 Total coupons found:', totalCount)
    
    const items = await collection
      .find(queryFilter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    
    console.log('📦 Items retrieved:', items.length)

    // Calculate stats from all matching coupons (not just current page)
    const redeemedCount = await collection.countDocuments({ ...queryFilter, redeemed: true })
    const activeCount = totalCount - redeemedCount
    
    // Calculate total value from all matching coupons
    const totalValueResult = await collection.aggregate([
      { $match: queryFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray()
    const totalValue = totalValueResult[0]?.total || 0
    
    console.log('📈 Stats calculated:', { totalCount, redeemedCount, activeCount, totalValue })

    return NextResponse.json({
      data: items,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
      stats: {
        totalCoupons: totalCount,
        redeemedCoupons: redeemedCount,
        activeCoupons: activeCount,
        totalValue: totalValue,
      },
    })
  } catch (err: unknown) {
    console.error('❌ Error fetching coupons:', err)
    const message = err instanceof Error ? err.message : 'Failed to fetch coupons'
    const stack = err instanceof Error ? err.stack : undefined
    console.error('Error details:', { message, stack })
    return NextResponse.json({ 
      error: message,
      details: process.env.NODE_ENV === 'development' ? stack : undefined
    }, { status: 500 })
  }
}


