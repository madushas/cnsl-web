import BlogClient from './BlogClient'
import { blogContent } from '@/lib/blog-content'

export default function Blog() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-8">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Blog</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Read our latest announcements, technical tutorials, event recaps, and member stories.
            Stay updated with the cloud-native ecosystem in Sri Lanka.
          </p>
        </header>

        <BlogClient posts={blogContent.posts} />
      </div>
    </section>
  )
}
