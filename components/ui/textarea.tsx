import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'placeholder:text-muted-foreground bg-surface-subtle border-border flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/20',
        'aria-invalid:border-red-500/50 aria-invalid:ring-red-500/20',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
