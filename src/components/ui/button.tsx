import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1 focus-visible:ring-offset-background active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45 select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-subtle hover:bg-primary/90 active:bg-primary/85 border border-primary/20',
        destructive: 'bg-destructive-500 text-white shadow-subtle hover:bg-destructive-600 active:bg-destructive-600 border border-destructive-600/20',
        outline: 'border border-border bg-card text-foreground shadow-subtle hover:bg-secondary hover:text-foreground active:bg-secondary/90',
        secondary: 'bg-secondary text-secondary-foreground border border-border/40 hover:bg-secondary/80 active:bg-secondary/90',
        ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground active:bg-secondary/80',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto cursor-pointer',
      },
      size: {
        default: 'h-9 px-3.5 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        xs: 'h-7 rounded px-2 text-2xs',
        lg: 'h-10 rounded-md px-5 text-sm',
        xl: 'h-11 rounded-md px-6 text-sm font-semibold',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7.5 w-7.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
