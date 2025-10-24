import { requireAdmin } from '@/lib/auth'
import { PostForm } from '@/components/admin/post-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewPostPage() {
  await requireAdmin()
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-foreground">Admin · New Post</h1>
      </div>
      <div className="rounded-lg border p-4">
        <PostForm mode="create" />
      </div>
    </div>
  )
}
