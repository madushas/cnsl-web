# Performance Optimization Guide

**Last Updated**: October 13, 2025

This guide covers performance optimization strategies for the CNSL website.

---

## Current Performance Status

### ✅ Already Optimized
- Database queries with proper indexes
- Server-side filtering and pagination
- Edge caching on Vercel
- Automatic image optimization (next/image)
- Code splitting (Next.js automatic)
- Static page generation where possible

### 🎯 Opportunities for Improvement
- React component memoization
- Virtual scrolling for large tables
- Bundle size reduction
- Advanced caching strategies

---

## Quick Wins (Low Effort, High Impact)

### 1. Enable Image Optimization

**Current**: Some images use `<img>` tags  
**Recommended**: Use Next.js `<Image>` component

#### Benefits:
- Automatic WebP conversion
- Lazy loading
- Responsive images
- Reduced bandwidth

#### Implementation:
```typescript
// Before
<img src="/events/event-photo.jpg" alt="Event" />

// After
import Image from 'next/image'
<Image 
  src="/events/event-photo.jpg" 
  alt="Event"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

**Impact**: 40-60% image size reduction

---

### 2. Add React.memo() to Expensive Components

**Target Components**:
- `components/data-table.tsx` (808 lines)
- `components/admin/event-rsvps-list.tsx` (535 lines)
- `components/admin/event-rsvps-checkpoints.tsx` (305 lines)

#### Example Implementation:
```typescript
// Before
export default function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // ...component logic
}

// After
import { memo } from 'react'

const DataTable = memo(function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // ...component logic
})

export default DataTable
```

**Impact**: Prevents unnecessary re-renders, ~20-30% faster

---

### 3. Lazy Load Heavy Components

**Target**: Admin dashboard components loaded on demand

```typescript
// app/(admin)/admin/events/[slug]/page.tsx
import dynamic from 'next/dynamic'

// Lazy load tabs
const EventRSVPsTabs = dynamic(() => import('@/components/admin/event-rsvps-tabs'), {
  loading: () => <div>Loading...</div>,
  ssr: false // If not needed for SEO
})
```

**Impact**: Faster initial page load

---

## Database Optimization

### Current Status: ✅ Already Optimized

**Existing Indexes**:
```typescript
// Events
- idx_events_status_date (published, date)
- events_slug_key (slug) - unique

// RSVPs  
- rsvps_event_idx (eventId)
- rsvps_email_idx (email)
- rsvps_event_email_key (eventId, email) - unique
- rsvps_status_idx (status)
- idx_rsvps_event_status (eventId, status)
- idx_rsvps_affiliation (affiliation)
- rsvps_ticket_number_key (ticketNumber) - unique

// Users
- idx_users_email (email)
- idx_users_phone (phone)

// Checkpoints
- checkpoints_rsvp_idx (rsvpId)
- checkpoints_type_idx (checkpointType)
- idx_checkpoints_rsvp_type (rsvpId, checkpointType)
```

### Query Optimization Tips:

#### 1. Use Select Specific Columns
```typescript
// ❌ Bad - selects all columns
const events = await db.select().from(schema.events)

// ✅ Good - select only needed columns
const events = await db.select({
  id: schema.events.id,
  title: schema.events.title,
  date: schema.events.date
}).from(schema.events)
```

#### 2. Use Pagination
```typescript
// ✅ Already implemented
.limit(pageSize)
.offset((page - 1) * pageSize)
```

#### 3. Avoid N+1 Queries
```typescript
// ❌ Bad - N+1 query
for (const event of events) {
  const rsvps = await db.select().from(schema.rsvps)
    .where(eq(schema.rsvps.eventId, event.id))
}

// ✅ Good - single query with join or batch
const ids = events.map(e => e.id)
const rsvps = await db.select().from(schema.rsvps)
  .where(inArray(schema.rsvps.eventId, ids))
```

---

## Frontend Performance

### 1. Component Memoization Strategy

#### When to Use React.memo()
- ✅ Large lists or tables
- ✅ Components that receive stable props
- ✅ Expensive calculations
- ❌ Simple components
- ❌ Components that change frequently

#### Example: Memo a List Item
```typescript
// components/event-card.tsx
import { memo } from 'react'

interface EventCardProps {
  event: Event
  onSelect: (id: string) => void
}

const EventCard = memo(function EventCard({ event, onSelect }: EventCardProps) {
  return (
    <div onClick={() => onSelect(event.id)}>
      <h3>{event.title}</h3>
      <p>{event.date}</p>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.event.id === nextProps.event.id
})

export default EventCard
```

---

### 2. useMemo() for Expensive Calculations

```typescript
import { useMemo } from 'react'

// ❌ Bad - recalculates on every render
function RSVPList({ rsvps, filter }) {
  const filtered = rsvps.filter(r => r.status === filter)
  return <div>{filtered.map(...)}</div>
}

// ✅ Good - only recalculates when dependencies change
function RSVPList({ rsvps, filter }) {
  const filtered = useMemo(() => {
    return rsvps.filter(r => r.status === filter)
  }, [rsvps, filter])
  
  return <div>{filtered.map(...)}</div>
}
```

---

### 3. useCallback() for Event Handlers

```typescript
import { useCallback } from 'react'

// ❌ Bad - creates new function on every render
function EventList({ onEventClick }) {
  return events.map(event => (
    <EventCard 
      key={event.id}
      onClick={() => onEventClick(event.id)} // New function every render!
    />
  ))
}

// ✅ Good - stable function reference
function EventList({ onEventClick }) {
  const handleClick = useCallback((id: string) => {
    onEventClick(id)
  }, [onEventClick])
  
  return events.map(event => (
    <EventCard key={event.id} onClick={handleClick} />
  ))
}
```

---

## Bundle Size Optimization

### 1. Analyze Bundle Size

```bash
# Add to package.json
"scripts": {
  "analyze": "ANALYZE=true next build"
}

# Install analyzer
pnpm add -D @next/bundle-analyzer

# Run analysis
pnpm analyze
```

### 2. Dynamic Imports for Large Libraries

```typescript
// ❌ Bad - loads entire library upfront
import { parsePhoneNumber } from 'libphonenumber-js'

// ✅ Good - load only when needed
const parsePhoneNumber = (await import('libphonenumber-js')).parsePhoneNumber
```

### 3. Tree Shaking

```typescript
// ❌ Bad - imports entire library
import _ from 'lodash'

// ✅ Good - imports only needed function
import debounce from 'lodash/debounce'
```

---

## Caching Strategies

### 1. API Route Caching

**Already implemented** in public routes:
```typescript
// app/api/events/route.ts
export const revalidate = 60 // Cache for 60 seconds
```

### 2. Client-Side Caching with SWR (Optional)

**Installation**:
```bash
pnpm add swr
```

**Example Usage**:
```typescript
import useSWR from 'swr'

function EventList() {
  const { data, error, isLoading } = useSWR('/api/events', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000 // Refresh every minute
  })
  
  if (isLoading) return <Skeleton />
  if (error) return <Error />
  return <Events data={data} />
}
```

**Benefits**:
- Automatic caching
- Deduplication
- Revalidation
- Offline support

---

## Virtual Scrolling (For Large Lists)

### When Needed
- Lists with 100+ items
- Heavy DOM manipulation
- Mobile performance issues

### Implementation with react-window

```bash
pnpm add react-window
```

```typescript
import { FixedSizeList } from 'react-window'

function RSVPList({ rsvps }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {rsvps[index].name} - {rsvps[index].email}
    </div>
  )
  
  return (
    <FixedSizeList
      height={600}
      itemCount={rsvps.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

**Impact**: Handle 10,000+ items smoothly

---

## Performance Monitoring

### 1. Web Vitals Tracking

**Already included** in Next.js:
```typescript
// app/layout.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric)
  // Send to analytics
}
```

### 2. Custom Performance Marks

```typescript
// lib/performance.ts
export function measurePerformance(label: string, fn: () => void) {
  performance.mark(`${label}-start`)
  fn()
  performance.mark(`${label}-end`)
  performance.measure(label, `${label}-start`, `${label}-end`)
  
  const measure = performance.getEntriesByName(label)[0]
  console.log(`${label}: ${measure.duration}ms`)
}

// Usage
measurePerformance('loadEvents', async () => {
  await fetch('/api/events')
})
```

### 3. Slow Query Logging

**Already implemented** in API routes:
```typescript
// lib/logger.ts
export const logger = {
  slowQuery: (operation: string, duration: number, meta?: any) => {
    if (duration > 1000) {
      console.warn(`[SLOW_QUERY] ${operation} took ${duration}ms`, meta)
    }
  }
}
```

---

## Production Checklist

### Before Deployment

- [ ] Run production build: `pnpm build`
- [ ] Check bundle size: `pnpm analyze`
- [ ] Test on slow 3G connection
- [ ] Test on mobile device
- [ ] Run Lighthouse audit (target: 90+ score)
- [ ] Enable compression (Vercel does this automatically)
- [ ] Configure CDN headers
- [ ] Enable HTTP/2 (Vercel does this automatically)

### Lighthouse Score Targets

| Metric | Target | Current |
|--------|--------|---------|
| Performance | 90+ | TBD |
| Accessibility | 90+ | TBD |
| Best Practices | 90+ | TBD |
| SEO | 90+ | TBD |

### Core Web Vitals Targets

| Metric | Target | Description |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |

---

## Performance Budget

### Budget Guidelines

| Resource | Budget | Notes |
|----------|--------|-------|
| Initial JS | < 200KB | Code split if larger |
| Initial CSS | < 50KB | Critical CSS only |
| Total Page Size | < 2MB | Including images |
| API Response | < 500ms | Server-side |
| Time to Interactive | < 3s | First page load |

### Monitoring

```bash
# Check bundle size
pnpm build | grep "First Load JS"

# Should see output like:
# First Load JS: 102 kB ✅
```

---

## Quick Performance Wins Summary

### Immediate (Already Done) ✅
- Database indexes
- Server-side pagination
- Query optimization
- Next.js automatic optimizations

### Easy (< 1 hour each)
1. Add React.memo() to 3 large components
2. Use next/image for all images
3. Lazy load admin components
4. Add bundle analyzer

### Medium (1-4 hours each)
1. Implement SWR for API caching
2. Add virtual scrolling for long lists
3. Optimize imports (tree shaking)
4. Set up performance monitoring

### Advanced (4+ hours)
1. Server Components migration (Next.js 13+)
2. Partial Pre-rendering
3. Advanced caching strategies
4. Image CDN optimization

---

## Measuring Impact

### Before Optimization
```bash
# Run Lighthouse
npx lighthouse https://cloudnative.lk --view

# Note scores
```

### After Optimization
```bash
# Run again
npx lighthouse https://cloudnative.lk --view

# Compare improvement
```

### Key Metrics to Track
- **Lighthouse Performance Score**: Target 90+
- **First Contentful Paint (FCP)**: Target < 1.8s
- **Largest Contentful Paint (LCP)**: Target < 2.5s
- **Time to Interactive (TTI)**: Target < 3.5s
- **Total Blocking Time (TBT)**: Target < 300ms

---

## Resources

### Tools
- **Lighthouse**: Chrome DevTools → Lighthouse
- **WebPageTest**: https://webpagetest.org
- **Bundle Analyzer**: `pnpm analyze`
- **React DevTools**: Profiler tab

### Documentation
- Next.js Performance: https://nextjs.org/docs/app/building-your-application/optimizing
- React Performance: https://react.dev/learn/render-and-commit
- Web Vitals: https://web.dev/vitals/

---

## Conclusion

### Current Status
Your application is **already well-optimized** with:
- ✅ Database indexes
- ✅ Server-side filtering
- ✅ Code splitting
- ✅ Edge caching

### Next Steps (Optional)
1. Add React.memo() to large components (Easy win)
2. Implement SWR for caching (Medium effort)
3. Monitor performance with Lighthouse (Ongoing)

### Expected Results
With recommended optimizations:
- **20-30% faster** rendering
- **40-60% smaller** images
- **Better** user experience
- **Lower** server costs

---

**Status**: ✅ Performance optimization guide complete  
**Priority**: Optional improvements (already fast)  
**Estimated Impact**: 20-40% performance improvement
