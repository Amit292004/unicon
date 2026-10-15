'use client'

import { FileText, FileImage, File, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResourceFileIconProps {
  mimeType?: string | null
  fileName?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getFileIcon(mimeType?: string | null, fileName?: string) {
  const mime = mimeType?.toLowerCase() || ''
  const ext = fileName?.split('.').pop()?.toLowerCase() || ''

  if (mime.includes('pdf') || ext === 'pdf') return { Icon: FileText, color: 'text-red-500 bg-red-50' }
  if (mime.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    return { Icon: FileImage, color: 'text-blue-500 bg-blue-50' }
  }
  if (mime.includes('zip') || mime.includes('compressed') || ['zip', 'rar', '7z', 'tar'].includes(ext)) {
    return { Icon: Archive, color: 'text-yellow-500 bg-yellow-50' }
  }
  if (
    mime.includes('word') || mime.includes('document') ||
    mime.includes('presentation') || mime.includes('sheet') ||
    ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)
  ) {
    return { Icon: FileText, color: 'text-blue-600 bg-blue-50' }
  }
  return { Icon: File, color: 'text-muted-foreground bg-muted' }
}

const sizeMap = {
  sm: 'h-8 w-8 p-1.5',
  md: 'h-10 w-10 p-2',
  lg: 'h-14 w-14 p-3',
}

const iconSizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

export function ResourceFileIcon({ mimeType, fileName, size = 'md', className }: ResourceFileIconProps) {
  const { Icon, color } = getFileIcon(mimeType, fileName)

  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-lg', sizeMap[size], color, className)}
      aria-hidden="true"
    >
      <Icon className={iconSizeMap[size]} />
    </span>
  )
}
