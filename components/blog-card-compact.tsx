import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export type BlogCardProps = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  image: string | null;
  date: string | null;
  author: string | null;
  isFeatured?: boolean;
};

export function BlogCardCompact({ post }: { post: BlogCardProps }) {
  return (
    <article
      className="group card-compact h-full flex flex-col"
      aria-labelledby={`post-${post.slug}-title`}
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Image
            src={post.image || "/cnsl-placeholder.svg"}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Category badge */}
          <Badge
            variant="default"
            className="absolute left-3 top-3 z-20 shadow-sm text-xs"
          >
            {post.category || "General"}
          </Badge>
          {/* Featured badge */}
          {post.isFeatured && (
            <Badge
              variant="secondary"
              className="absolute right-3 top-3 z-20 shadow-sm text-xs"
            >
              Featured
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 space-y-2">
          {/* Title */}
          <h3
            id={`post-${post.slug}-title`}
            className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors"
          >
            {post.title}
          </h3>

          {/* Meta */}
          <div className="text-xs text-muted-foreground">
            {post.date && new Date(post.date).toLocaleDateString()} ·{" "}
            {post.author || "CNSL"}
          </div>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {post.excerpt || ""}
          </p>

          {/* Footer */}
          <div className="pt-2 mt-auto">
            <span className="text-sm text-primary group-hover:underline inline-flex items-center gap-1">
              Read more
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
