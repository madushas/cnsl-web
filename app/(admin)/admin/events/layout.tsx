import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminEventsLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <>{children}</>
}
