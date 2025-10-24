"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Search, X } from "lucide-react";

type PostItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  image: string | null;
  date: string | null;
  author: string | null;
  tags: string;
};

export function BlogModernLayout({ posts }: { posts: PostItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set(
      posts.map((p) => p.category || "General").filter(Boolean)
    );
    return Array.from(categorySet) as string[];
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
  }, [posts, searchQuery, selectedCategory]);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Posts Display */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No articles found</p>
          {(searchQuery || selectedCategory) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Post - Hero Card */}
          {featuredPost && (
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="block group"
            >
              <article className="grid md:grid-cols-5 gap-6 border border-border rounded-xl overflow-hidden hover:border-primary transition-colors bg-card">
                <div className="relative aspect-[16/10] md:aspect-auto md:col-span-3">
                  <Image
                    src={featuredPost.image ?? "/cnsl-placeholder.svg"}
                    alt={featuredPost.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 md:col-span-2 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge>{featuredPost.category || "General"}</Badge>
                    <Badge variant="outline">Featured</Badge>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors line-clamp-3">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-muted-foreground line-clamp-3 mb-6">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {featuredPost.date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={featuredPost.date}>
                          {new Date(featuredPost.date).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </time>
                      </div>
                    )}
                    {featuredPost.author && (
                      <span className="font-medium">{featuredPost.author}</span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Regular Posts - Grid */}
          {regularPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BlogCard({ post }: { post: PostItem }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block group border border-border rounded-xl overflow-hidden hover:border-primary transition-colors bg-card"
    >
      <article>
        <div className="relative aspect-[16/10]">
          <Image
            src={post.image ?? "/cnsl-placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-5 space-y-3">
          <Badge className="w-fit">{post.category || "General"}</Badge>
          <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
            {post.date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
            )}
            {post.author && (
              <span className="font-medium">{post.author}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}