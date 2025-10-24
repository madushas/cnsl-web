import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-blue-600 selection:text-white bg-surface-subtle border-border flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/20',
        'aria-invalid:border-red-500/50 aria-invalid:ring-red-500/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
