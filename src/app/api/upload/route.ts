import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// Maximum file size: 15MB (accommodates high-res notices and multi-page PDFs)
const MAX_FILE_SIZE = 15 * 1024 * 1024

// Permitted MIME types for institutional notices: Images & PDF documents
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
]

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please attach an image or PDF document.' },
        { status: 400 }
      )
    }

    // Validate MIME type
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name)

    if (!ALLOWED_MIME_TYPES.includes(file.type) && !isPdf && !isImage) {
      return NextResponse.json(
        {
          error:
            'Unsupported file format. Please upload either an image (PNG, JPEG, WebP, GIF, SVG) or a PDF document.',
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds the maximum permitted size of 15 MB.' },
        { status: 400 }
      )
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN

    // 1. Production / Vercel Blob store enabled
    if (token) {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const blob = await put(`notices/${Date.now()}-${sanitizedName}`, file, {
        access: 'public',
        token,
        contentType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
      })

      return NextResponse.json({
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
        contentType: blob.contentType,
        fileSize: file.size,
        provider: 'vercel-blob',
      })
    }

    // 2. Local development fallback when BLOB_READ_WRITE_TOKEN is not configured
    // Encodes as Data URL so developer / tester can preview and display immediately
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mime = file.type || (isPdf ? 'application/pdf' : 'application/octet-stream')
    const dataUrl = `data:${mime};base64,${base64}`

    return NextResponse.json({
      url: dataUrl,
      pathname: file.name,
      contentType: mime,
      fileSize: file.size,
      provider: 'dev-fallback',
      warning:
        'BLOB_READ_WRITE_TOKEN not set in environment. Stored as Data URL for immediate local preview and testing.',
    })
  } catch (error) {
    console.error('Error uploading notice attachment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload attachment' },
      { status: 500 }
    )
  }
}
