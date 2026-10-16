import { NextResponse } from 'next/server'
import { SEEDED_POSTS } from '@/lib/data/store'
import { postSchema } from '@/lib/validations'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const collegeId = searchParams.get('collegeId') || 'col-002'

  const posts = SEEDED_POSTS.filter((p) => p.collegeId === collegeId)
  return NextResponse.json({ data: posts, total: posts.length })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = postSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid post content', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const newPost = {
      id: `pst-${Date.now()}`,
      collegeId: 'col-002',
      authorId: 'usr-student-001',
      type: result.data.type,
      content: result.data.content,
      imageUrl: null,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      author: {
        fullName: 'Alex Chen',
        username: 'alex_chen',
        avatarUrl: null,
      },
      hasLiked: false,
    }

    return NextResponse.json({ data: newPost }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
