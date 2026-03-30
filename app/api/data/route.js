import 'server-only'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const binId = process.env.JSONBIN_BIN_ID
  const apiKey = process.env.JSONBIN_API_KEY

  if (!binId || !apiKey) {
    return NextResponse.json(
      { error: 'Missing JSONBIN_BIN_ID or JSONBIN_API_KEY in environment' },
      { status: 500 }
    )
  }

  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { 'X-Master-Key': apiKey },
    cache: 'no-store',
  })

  if (!res.ok) {
    const upstreamBody = await res.text()
    return NextResponse.json(
      { error: 'Failed to fetch JSONBin data', status: res.status, upstreamBody },
      { status: 502 }
    )
  }

  const json = await res.json()
  const record = json?.record

  if (!record?.sender || !record?.receiver) {
    return NextResponse.json(
      { error: 'Unexpected JSONBin payload shape' },
      { status: 500 }
    )
  }

  const distance_m = haversine(
    record.sender.lat,
    record.sender.lon,
    record.receiver.lat,
    record.receiver.lon
  )

  return NextResponse.json({ ...record, distance_m })
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)))
}