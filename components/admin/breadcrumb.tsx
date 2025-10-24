"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb() {
  const pathname = usePathname()

  const items = useMemo(() => {
    // Parse the pathname into breadcrumb items
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/admin' }
    ]

    // Build breadcrumbs from segments
    let currentPath = ''
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`

      // Skip 'admin' as it's already home
      if (segment === 'admin') continue

      // Format the label
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      // Special cases for better readability
      if (segment === 'rsvps') label = 'RSVPs'
      if (segment === 'cnsl-connect') label = 'CNSL Connect'
      
      // Check if this is a UUID or slug (dynamic segment)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
      const isDynamic = segment.length > 20 || isUUID
      
      if (isDynamic) {
        // For dynamic segments, use a generic label or try to get from context
        label = segments[i - 1] === 'events' ? 'Event Details' :
                segments[i - 1] === 'posts' ? 'Post Details' :
                'Details'
      }

      // Last item has no href (current page)
      const isLast = i === segments.length - 1
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      })
    }

    return breadcrumbs
  }, [pathname])

  // Don't show breadcrumbs on the main admin dashboard
  if (pathname === '/admin') return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={item.href || item.label} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            {index === 0 ? (
              <Link
                href={item.href!}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="sr-only md:not-sr-only">{item.label}</span>
              </Link>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
