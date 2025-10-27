"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { EmptyState } from "@/components/empty-state";
import Image from "next/image";

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

export function BlogClientFilter({ posts }: { posts: PostItem[] }) {
  const [category, setCategory] = useState<string>("All");
  const [q, setQ] = useState<string>("");

  // Local debounced value for search to reduce re-renders while typing
  function useDebouncedLocal<T>(value: T, ms = 300) {
    const [deb, setDeb] = useState<T>(value);
    useEffect(() => {
      const t = setTimeout(() => setDeb(value), ms);
      return () => clearTimeout(t);
    }, [value, ms]);
    return deb;
  }


  // Share helper (Web Share API fallback to clipboard)
  async function sharePost(slug: string, title: string) {
    const url = `${typeof window !== "undefined" ? location.origin : ""}/blog/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const t = document.createElement("textarea");
        t.value = url;
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        t.remove();
      }
    } catch {
      // silent
    }
  }

  const data = posts.map((p) => ({
    ...p,
    excerpt: p.excerpt || "",
    category: p.category || "General",
    image: p.image || "/cnsl-placeholder.svg",
    date: p.date || new Date().toISOString().slice(0, 10),
    author: p.author || "CNSL",
    tagsArray: String(p.tags || "")
      .split(",")
      .filter(Boolean),
  }));

  const featured = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(data.map((p) => p.category)))],
    [data],
  );
  const filtered = useMemo(() => {
    return data
      .filter((p) => (category === "All" ? true : p.category === category))
      .filter((p) =>
        q.trim() === ""
          ? true
          : (p.title + " " + p.excerpt).toLowerCase().includes(q.toLowerCase()),
      )
      .filter((p) => p.slug !== featured?.slug)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data, category, q, featured]);

  return (
    <>
      {featured && (
        <Reveal>
          {/* Featured card — more emphasis, accessible landmark */}
          <article
            aria-labelledby="featured-title"
            className="mb-10 block overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="grid gap-0 md:grid-cols-2">
              <div className="relative aspect-video md:aspect-auto">
                <Image
                  src={featured.image || "/cnsl-placeholder.svg"}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="card-padding md:card-padding-lg flex flex-col justify-center">
                <span className="inline-flex w-fit items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400 border border-blue-500/20">
                  Featured
                </span>
                <h2
                  id="featured-title"
                  className="mt-3 text-h3 text-foreground"
                >
                  {featured.title}
                </h2>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(featured.date).toLocaleDateString()} ·{" "}
                  {featured.author}
                </div>
                <p className="mt-3 text-muted-foreground line-clamp-4">
                  {featured.excerpt}
                </p>
                <div className="mt-4">
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Read article
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </Reveal>
      )}

      {/* Layout: left sidebar for category + search, right main for featured + posts */}
      <div className="mb-8 grid gap-8 lg:grid-cols-[240px,1fr]">
        <aside className="order-2 lg:order-1">
          <div className="sticky top-24 space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Category
              </h3>
              <div className="space-y-2">
                {/* Provide a clear list for categories to improve scanability */}
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm ${category === c ? "bg-surface-subtle border border-border text-foreground" : "text-muted-foreground hover:bg-surface-subtle"}`}
                    aria-pressed={category === c}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Search
              </h3>
              <Input
                id="blog-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles"
                className="bg-surface-subtle border-border"
                aria-label="Search blog articles"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setCategory("All");
                  setQ("");
                }}
                className="w-full inline-flex justify-center rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-surface-subtle"
              >
                Reset filters
              </button>
            </div>
          </div>
        </aside>

        {/* Main column: featured already rendered above; posts grid below */}
        <div className="order-1 lg:order-2">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, idx) => (
              <Reveal key={post.slug} delay={idx * 60}>
                <article
                  className="group overflow-hidden bg-card border-border transition-card hover:shadow-card-hover hover:-translate-y-1"
                  aria-labelledby={`post-${post.slug}-title`}
                >
                  <div className="relative aspect-4/3 overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-10 opacity-30" />
                    <Image
                      src={post.image || "/cnsl-placeholder.svg"}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <Badge
                      variant="default"
                      className="absolute left-4 top-4 z-20 shadow-sm"
                    >
                      {post.category}
                    </Badge>
                  </div>
                  <CardContent className="card-padding space-y-2">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <h3
                        id={`post-${post.slug}-title`}
                        className="text-h3 text-foreground group-hover:text-blue-400 transition-colors line-clamp-2"
                      >
                        {post.title}
                      </h3>
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {new Date(post.date).toLocaleDateString()} · {post.author}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-3">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline"
                      >
                        Read more
                      </Link>
                    </div>
                  </CardContent>
                </article>
              </Reveal>
            ))}
            {filtered.length === 0 && (
              <EmptyState
                title="No posts match your filters."
                subtitle="Try a different category or search term."
                actionHref="/blog"
                actionLabel="Reset filters"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
