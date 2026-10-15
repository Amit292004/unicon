import { NextResponse } from 'next/server'
import { SEEDED_COLLEGES, SEEDED_DEPARTMENTS } from '@/lib/data/store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const collegeId = searchParams.get('collegeId')
  const query = searchParams.get('q')?.toLowerCase()

  if (collegeId) {
    const college = SEEDED_COLLEGES.find((c) => c.id === collegeId)
    const departments = SEEDED_DEPARTMENTS.filter((d) => d.collegeId === collegeId)
    return NextResponse.json({ college, departments })
  }

  let filtered = SEEDED_COLLEGES.filter((c) => c.isApproved)
  if (query) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.city && c.city.toLowerCase().includes(query)) ||
        (c.state && c.state.toLowerCase().includes(query))
    )
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
  })
}
