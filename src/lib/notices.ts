/**
 * Utility functions for notice attachments (Images & PDF documents)
 */

export function isPdfAttachment(url?: string | null): boolean {
  if (!url) return false
  if (url.startsWith('data:application/pdf')) return true
  const cleanUrl = url.split('?')[0].toLowerCase()
  return cleanUrl.endsWith('.pdf')
}

export function isImageAttachment(url?: string | null): boolean {
  if (!url) return false
  if (url.startsWith('data:image/')) return true
  const cleanUrl = url.split('?')[0].toLowerCase()
  return (
    cleanUrl.endsWith('.jpg') ||
    cleanUrl.endsWith('.jpeg') ||
    cleanUrl.endsWith('.png') ||
    cleanUrl.endsWith('.webp') ||
    cleanUrl.endsWith('.gif') ||
    cleanUrl.endsWith('.svg')
  )
}

export function getAttachmentName(url?: string | null, fallback = 'Attachment'): string {
  if (!url) return fallback
  if (url.startsWith('data:')) {
    if (url.startsWith('data:application/pdf')) return 'official_circular.pdf'
    if (url.startsWith('data:image/')) return 'notice_image.png'
    return fallback
  }
  try {
    const pathname = url.split('?')[0]
    const filename = pathname.split('/').pop()
    if (filename && filename.length > 0) {
      return decodeURIComponent(filename)
    }
  } catch {
    // fallback
  }
  return fallback
}

export function getAttachmentTypeLabel(url?: string | null): string {
  if (isPdfAttachment(url)) return 'PDF Document'
  if (isImageAttachment(url)) return 'Image Notice'
  return 'Document Attachment'
}
