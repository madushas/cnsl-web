import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-quick disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50",
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white hover:bg-blue-700 shadow-cta rounded-lg',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-sm rounded-lg',
        outline:
          'border-2 border-blue-500/30 bg-transparent text-blue-400 hover:bg-blue-500/10 hover:border-blue-500 rounded-lg',
        secondary:
          'bg-surface-subtle text-foreground border border-border hover:bg-surface-muted rounded-lg',
        ghost:
          'text-white/90 hover:text-blue-400 hover:bg-surface-subtle',
        link: 'text-blue-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 py-1.5 text-xs',
        lg: 'h-12 px-8 py-3 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
