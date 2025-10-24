import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-quick overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white border-transparent rounded-full shadow-sm',
        secondary:
          'bg-blue-500/10 text-blue-400 border-blue-500/20 rounded-full',
        outline:
          'bg-transparent text-blue-400 border-blue-500/30 rounded-full hover:bg-blue-500/10',
        subtle:
          'bg-surface-subtle text-muted-foreground border-border rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
