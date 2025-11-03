'use client'

import { useEffect, useState } from 'react'

type Coupon = {
  _id: string
  transactionId?: string
  purchaserEmail?: string
  recipientEmail?: string
  purchaserName?: string
  recipientName?: string
  amount?: number
  couponCode?: string
  status?: string
  timestamp?: string
  redeemed?: boolean
  redeemedAt?: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const url = q ? `/api/admin/coupons?q=${encodeURIComponent(q)}` : '/api/admin/coupons'
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(`HTTP ${res.status}: ${t}`)
      }
      const json = await res.json()
      setCoupons(json.data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load coupons')
      setCoupons([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function markRedeemed(id: string) {
    await fetch(`/api/admin/coupons/${id}`, { method: 'PATCH' })
    load()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Coupons</h1>
      {error && (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      )}
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 w-full max-w-md"
          placeholder="Search by code, email, or name"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <button className="px-4 py-2 bg-black text-white rounded" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Search'}
        </button>
      </div>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Purchaser</th>
              <th className="text-left p-2">Recipient</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c._id} className="border-t">
                <td className="p-2">{c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}</td>
                <td className="p-2 font-mono">{c.couponCode}</td>
                <td className="p-2">£{c.amount}</td>
                <td className="p-2">{c.purchaserName} ({c.purchaserEmail})</td>
                <td className="p-2">{c.recipientName} ({c.recipientEmail})</td>
                <td className="p-2">{c.redeemed ? 'Redeemed' : (c.status || 'paid')}</td>
                <td className="p-2">
                  {!c.redeemed && (
                    <button className="px-3 py-1 border rounded" onClick={() => markRedeemed(c._id)}>Mark redeemed</button>
                  )}
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={7}>No coupons found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


