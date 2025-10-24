import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db, schema } from "@/db"
import { eq } from "drizzle-orm"
import type { Metadata } from "next"
import Image from "next/image"

export const revalidate = 60 // ISR: cache for 60 seconds

type PostItem = {
  slug: string
  title: string
  excerpt: string
  category: string
  image: string
  date: string
  author: string
  tags: string[]
  content?: string[]
}

async function getPost(slug: string): Promise<PostItem | null> {
  const [row] = await db.select().from(schema.posts).where(eq(schema.posts.slug, slug)).limit(1)
  if (!row) return null
  
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    category: row.category || 'General',
    image: row.image || '/cnsl-placeholder.svg',
    date: row.date ? (row.date instanceof Date ? row.date.toISOString() : String(row.date)) : new Date().toISOString(),
    author: row.author || 'CNSL',
    tags: String(row.tags || '').split(',').filter(Boolean),
    content: String(row.content || '').split('\n\n').filter(Boolean),
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const post = await getPost(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | CNSL Blog',
    }
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const imgUrl = post.image
    ? (post.image.startsWith('http://') || post.image.startsWith('https://') ? post.image : `${siteUrl}${post.image}`)
    : undefined
  
  return {
    title: `${post.title} | CNSL Blog`,
    description: post.excerpt || `Read ${post.title} on CNSL Blog`,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: imgUrl ? [{ url: imgUrl, width: 1200, height: 630 }] : [],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      url: `${siteUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
      images: imgUrl ? [imgUrl] : [],
    },
  }
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const post = await getPost(slug)
  
  if (!post) {
    notFound()
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image ? [`${siteUrl}${post.image}`] : [],
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: post.author || 'CNSL',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Colombo Network for Software and Law (CNSL)',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="container mx-auto px-4 section-spacing-sm">
        <article className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <Badge variant="default">{post.category}</Badge>
            <h1 className="text-h2 text-foreground leading-tight">{post.title}</h1>
            <div className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()} • {post.author}</div>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={post.image || "/cnsl-placeholder.svg"}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>

          <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground">
            {post.content?.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {post.tags?.length ? (
            <div className="pt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full border border-border px-2 py-1">#{t}</span>
              ))}
            </div>
          ) : null}

          <div className="pt-6">
            <Link href="/blog" className="text-blue-400 hover:underline">← Back to Blog</Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
