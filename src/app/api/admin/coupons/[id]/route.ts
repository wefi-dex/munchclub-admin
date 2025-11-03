import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '@/lib/mongo'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getMongoDb()
    const collection = db.collection('coupons')
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { redeemed: true, redeemedAt: new Date() } }
    )
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update coupon'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


