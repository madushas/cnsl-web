"use client";

import { useMemo, useState, useTransition } from "react";
import {
  BlogCardCompact,
  type BlogCardProps,
} from "@/components/blog-card-compact";
import {
  FilterPanel,
  type FilterOption,
  type FilterStats,
} from "@/components/filter-panel";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export function BlogClientFilterCompact({ posts }: { posts: BlogCardProps[] }) {
  const [category, setCategory] = useState<string>("All");
  const [q, setQ] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [isPending, startTransition] = useTransition();

  const PAGE_SIZE = 12;

  // Derive categories
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(posts.map((p) => p.category || "General").filter(Boolean)),
      ),
    ],
    [posts],
  );

  // Filter posts
  const filtered = useMemo(() => {
    return posts
      .filter((p) => (category === "All" ? true : p.category === category))
      .filter((p) =>
        q.trim() === ""
          ? true
          : (p.title + " " + (p.excerpt || ""))
              .toLowerCase()
              .includes(q.toLowerCase()),
      )
      .sort(
        (a, b) =>
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
      );
  }, [category, q, posts]);

  // Mark first post as featured
  const postsWithFeatured = useMemo(() => {
    return filtered.map((post, idx) => ({
      ...post,
      isFeatured: idx === 0,
    }));
  }, [filtered]);

  // Filter configuration
  const filterConfig: FilterOption[] = [
    {
      type: "select",
      label: "Category",
      value: category,
      options: categories,
      onChange: (v) => startTransition(() => setCategory(v)),
    },
    {
      type: "search",
      label: "Search",
      value: q,
      onChange: setQ,
      placeholder: "Search articles...",
    },
  ];

  // Stats
  const stats: FilterStats[] = [
    { label: "Total Articles", value: posts.length },
    { label: "Categories", value: categories.length - 1 }, // Excluding "All"
  ];

  const appliedFiltersCount = [
    category !== "All" ? 1 : 0,
    q.trim() !== "" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  function resetFilters() {
    startTransition(() => {
      setCategory("All");
      setQ("");
    });
  }

  const visiblePosts = postsWithFeatured.slice(0, visibleCount);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
      {/* Filter Panel */}
      <FilterPanel
        filters={filterConfig}
        stats={stats}
        onReset={resetFilters}
        appliedCount={appliedFiltersCount}
      />

      {/* Main Content */}
      <section>
        {visiblePosts.length > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {visiblePosts.map((post) => (
                <BlogCardCompact key={post.slug} post={post} />
              ))}
            </div>

            {/* Load More */}
            {filtered.length > visibleCount && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  disabled={isPending}
                >
                  {isPending ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="No articles found"
            subtitle="Try adjusting your search or category filter."
            actionHref="/blog"
            actionLabel="Clear Filters"
          />
        )}
      </section>
    </div>
  );
}
