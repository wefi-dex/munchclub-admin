import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Best-effort cleanup of related entities where applicable
    await prisma.session.deleteMany({ where: { userId } }).catch(() => {})
    await prisma.account.deleteMany({ where: { userId } }).catch(() => {})
    await prisma.book.deleteMany({ where: { userId } }).catch(() => {})
    await prisma.recipe.deleteMany({ where: { userId } }).catch(() => {})
    await prisma.communication.deleteMany({ where: { userId } }).catch(() => {})

    // Finally delete the user (use deleteMany to avoid P2025 if already gone)
    await prisma.user.deleteMany({ where: { id: userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}



