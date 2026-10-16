import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Permitted image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a JPEG, PNG, WebP, or GIF image.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image exceeds the maximum allowed size of 5 MB.' },
        { status: 400 }
      )
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN

    // 1. Production / Vercel Blob store enabled
    if (token) {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const blob = await put(`lost-found/${Date.now()}-${sanitizedName}`, file, {
        access: 'public',
        token,
        contentType: file.type,
      })

      return NextResponse.json({
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
        contentType: blob.contentType,
        provider: 'vercel-blob',
      })
    }

    // 2. Local development fallback when BLOB_READ_WRITE_TOKEN is not yet set
    // Encodes as Data URL so developer / tester can preview immediately
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      url: dataUrl,
      pathname: file.name,
      contentType: file.type,
      provider: 'dev-fallback',
      warning: 'BLOB_READ_WRITE_TOKEN not set in environment. Saved as data URL for local preview.',
    })
  } catch (error) {
    console.error('Error uploading image to Vercel Blob:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    )
  }
}
