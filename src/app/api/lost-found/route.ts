import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { lostFoundReportSchema } from '@/lib/validations'

// GET /api/lost-found - List reports for user's college
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's profile to get college_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('college_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 20
  const type = searchParams.get('type') // 'lost' | 'found' | null
  const status = searchParams.get('status') || 'active'
  const category = searchParams.get('category')
  const myReports = searchParams.get('my') === 'true'
  const myClaims = searchParams.get('my_claims') === 'true'
  const search = searchParams.get('q')

  let query = supabase
    .from('lost_found_reports')
    .select(`
      *,
      reporter:profiles!reporter_id(full_name, username, avatar_url),
      claims:lost_found_claims(id, status, claimant_id)
    `, { count: 'exact' })
    .eq('college_id', profile.college_id)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (type) query = query.eq('type', type)
  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)
  if (myReports) query = query.eq('reporter_id', user.id)
  if (search) {
    query = query.or(`item_name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (myClaims) {
    // Get reports where user has a claim
    const { data: claimReportIds } = await supabase
      .from('lost_found_claims')
      .select('report_id')
      .eq('claimant_id', user.id)

    const ids = (claimReportIds || []).map((c: { report_id: string }) => c.report_id)
    if (ids.length === 0) {
      return NextResponse.json({ data: [], total: 0, page, pageSize, hasMore: false })
    }
    query = query.in('id', ids)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }

  // Calculate stats
  const { data: stats } = await supabase
    .from('lost_found_reports')
    .select('type, status', { count: 'exact' })
    .eq('college_id', profile.college_id)

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > page * pageSize,
  })
}

// POST /api/lost-found - Create a report
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('college_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const body = await request.json()
  const result = lostFoundReportSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data', details: result.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('lost_found_reports')
    .insert({
      college_id: profile.college_id,
      reporter_id: user.id,
      type: result.data.type,
      item_name: result.data.itemName,
      category: result.data.category,
      description: result.data.description,
      location: result.data.location || null,
      date_occurred: result.data.dateOccurred || null,
      handover_info: result.data.handoverInfo || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }

  // Trigger automatic matching
  await triggerMatching(supabase, data, profile.college_id)

  return NextResponse.json({ data }, { status: 201 })
}

// Automatic keyword matching
async function triggerMatching(
  supabase: Awaited<ReturnType<typeof createClient>>,
  newReport: { id: string; type: string; item_name: string; category: string; description: string; reporter_id: string; college_id: string },
  collegeId: string
) {
  try {
    // Find opposite type reports in same college, same category
    const oppositeType = newReport.type === 'lost' ? 'found' : 'lost'
    const { data: candidates } = await supabase
      .from('lost_found_reports')
      .select('id, item_name, description, reporter_id')
      .eq('college_id', collegeId)
      .eq('type', oppositeType)
      .eq('status', 'active')
      .eq('category', newReport.category)
      .limit(10)

    if (!candidates || candidates.length === 0) return

    // Simple keyword matching score
    const keywords = newReport.item_name.toLowerCase().split(/\s+/)
      .concat(newReport.description.toLowerCase().split(/\s+/))
      .filter((w: string) => w.length > 3)

    for (const candidate of candidates) {
      const candidateText = `${candidate.item_name} ${candidate.description}`.toLowerCase()
      const matchingKeywords = keywords.filter((kw: string) => candidateText.includes(kw))
      const score = Math.round((matchingKeywords.length / Math.max(keywords.length, 1)) * 100)

      if (score >= 30) {
        const lostId = newReport.type === 'lost' ? newReport.id : candidate.id
        const foundId = newReport.type === 'found' ? newReport.id : candidate.id

        await supabase.from('lost_found_matches').insert({
          lost_report_id: lostId,
          found_report_id: foundId,
          match_score: score,
          is_notified: false,
        })

        // Notify the lost item reporter
        const lostReporterId = newReport.type === 'lost' ? newReport.reporter_id : candidate.reporter_id
        await supabase.from('notifications').insert({
          user_id: lostReporterId,
          type: 'lost_found_match',
          title: 'Potential match found for your lost item',
          body: `A found item report may match your "${newReport.type === 'lost' ? newReport.item_name : candidate.item_name}" report.`,
          resource_type: 'lost_found_report',
          resource_id: foundId,
        })
      }
    }
  } catch (e) {
    // Non-critical - matching failure should not break the report creation
    console.error('Matching error:', e)
  }
}
