import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BlogModernLayout } from "@/components/blog-modern-layout"
import { db, schema } from "@/db"
import { desc } from "drizzle-orm"
import type { Metadata } from "next"
import { logger } from "@/lib/logger"

export const revalidate = 60 // ISR: cache for 60 seconds

export const metadata: Metadata = {
  title: 'Blog & Updates | CNSL',
  description: 'Community recaps, news, and guides from Cloud Native Sri Lanka.',
  alternates: { canonical: '/blog' },
}

type PostItem = {
  slug: string
  title: string
  excerpt: string | null
  category: string | null
  image: string | null
  date: string | null
  author: string | null
  tags: string
}

async function getPosts(): Promise<PostItem[]> {
  try {
    const rows = await db.select().from(schema.posts).orderBy(desc(schema.posts.date))
    return rows.map(r => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      category: r.category,
      image: r.image,
      date: r.date ? (r.date instanceof Date ? r.date.toISOString() : String(r.date)) : null,
      author: r.author,
      tags: r.tags || '',
    }))
  } catch (e) {
    logger.error('BLOG_PAGE_DB_FAIL', { error: e instanceof Error ? e : String(e) })
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Blog & Updates</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Stay updated with community recaps, technical guides, and the latest news from Cloud Native Sri Lanka.
          </p>
        </div>

        <BlogModernLayout posts={posts} />
      </main>
      <Footer />
    </div>
  )
}
