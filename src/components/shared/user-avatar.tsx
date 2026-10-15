'use client'

import { cn, getInitials } from '@/lib/utils'

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export function UserAvatar({ name, avatarUrl, size = 'md', className }: UserAvatarProps) {
  const initials = getInitials(name)
  const sizeClass = sizeMap[size]

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={cn(
          'rounded-full object-cover ring-2 ring-background',
          sizeClass,
          className
        )}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-2 ring-background select-none',
        sizeClass,
        className
      )}
      aria-label={name}
      role="img"
    >
      {initials}
    </span>
  )
}
