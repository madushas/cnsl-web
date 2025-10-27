"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import {
  IconSearch,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconRefresh,
  IconFileText,
} from "@tabler/icons-react";
import type { Post as PostType } from "@/components/admin/post-form";
import { useDebouncedValue } from "@/lib/hooks/use-debounce";
import { withCSRF } from "@/lib/csrf";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/admin/post-card";
import { FilterPanel } from "@/components/admin/filter-panel";
import { EmptyState } from "@/components/admin/empty-state";
import { ActiveFiltersBar } from "@/components/admin/active-filter-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ListResp = {
  items: PostType[];
  total: number;
  page: number;
  pageSize: number;
};

export default function AdminPostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // query state
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // data
  const [rows, setRows] = useState<PostType[]>([]);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostType | null>(null);

  // drawer removed in favor of dedicated pages

  // Debounce search input
  const debouncedQ = useDebouncedValue(q, 500);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const categories = useMemo(
    () =>
      Array.from(
        new Set(rows.map((r) => r.category).filter(Boolean)),
      ) as string[],
    [rows],
  );

  // Initialize state from URL
  useEffect(() => {
    const sp = searchParams;
    if (!sp) return;
    setQ(sp.get("q") || "");
    setCategory((sp.get("category") || "").toString());
    const sb = sp.get("sortBy") || "date";
    setSortBy(sb === "title" ? "title" : "date");
    const sd = sp.get("sortDir") || "desc";
    setSortDir(sd === "asc" ? "asc" : "desc");
    const pg = Number(sp.get("page") || "1");
    setPage(Number.isFinite(pg) && pg > 0 ? pg : 1);
    const psz = Number(sp.get("pageSize") || "10");
    setPageSize([10, 20, 50, 100].includes(psz) ? psz : 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(signal?: AbortSignal) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortDir,
      });
      if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
      if (category.trim()) params.set("category", category.trim());
      const res = await fetch(`/api/admin/posts?${params.toString()}`, {
        cache: "no-store",
        signal,
      });
      const data: ListResp = await res.json();
      if (!res.ok) throw new Error("Failed to load posts");
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        // ignore abort
      } else {
        setError(e instanceof Error ? e.message : "Failed to load posts");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ab = new AbortController();
    load(ab.signal);
    return () => ab.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ab = new AbortController();
    load(ab.signal);
    return () => ab.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, category, sortBy, sortDir, page, pageSize]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    if (category.trim()) params.set("category", category.trim());
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    router.replace(
      params.toString() ? `/admin/posts?${params.toString()}` : "/admin/posts",
      { scroll: false },
    );
  }, [debouncedQ, category, sortBy, sortDir, page, pageSize, router]);



  async function del(slug: string) {
    const prev = rows;
    setRows((rs) => rs.filter((r) => r.slug !== slug));
    const res = await fetch(`/api/posts/${slug}`, {
      method: "DELETE",
      headers: withCSRF(),
    });
    if (res.ok) {
      toast.success("Post deleted");
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setRows(prev);
      toast.error(data?.error || "Failed to delete post");
    }
  }



  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your blog posts and articles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => load()}>
            <IconRefresh className="size-4" />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/posts/new">
              <IconPlus className="size-4" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Active Filters Indicator */}
      <ActiveFiltersBar
        filters={[
          ...(debouncedQ
            ? [{ label: "Search", value: debouncedQ, onClear: () => setQ("") }]
            : []),
          ...(category
            ? [
                {
                  label: "Category",
                  value: category,
                  onClear: () => setCategory(""),
                },
              ]
            : []),
          ...(sortBy !== "date" || sortDir !== "desc"
            ? [
                {
                  label: "Sort",
                  value: `${sortBy} (${sortDir})`,
                  onClear: () => {
                    setSortBy("date");
                    setSortDir("desc");
                  },
                },
              ]
            : []),
        ]}
        onClearAll={() => {
          setQ("");
          setCategory("");
          setSortBy("date");
          setSortDir("desc");
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              post &quot;{postToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (postToDelete) {
                  del(postToDelete.slug);
                  setDeleteDialogOpen(false);
                  setPostToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filters */}
      <FilterPanel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Search
            </Label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search posts..."
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c!}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Sort By</Label>
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v === "title" ? "title" : "date")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Order</Label>
            <Select
              value={sortDir}
              onValueChange={(v) => setSortDir(v === "asc" ? "asc" : "desc")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FilterPanel>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && rows.length === 0 && (
        <EmptyState
          icon={<IconFileText className="size-20" />}
          title="No posts found"
          description="Get started by creating your first blog post"
          action={{
            label: "Create Post",
            onClick: () => router.push("/admin/posts/new"),
          }}
        />
      )}

      {/* Posts Grid */}
      {!loading && rows.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((post) => (
            <PostCard
              key={post.slug}
              {...post}
              onDelete={() => {
                setPostToDelete(post);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && rows.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-card p-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(page - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(page * pageSize, total)}
              </span>{" "}
              of <span className="font-medium text-foreground">{total}</span>{" "}
              posts
            </div>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page <= 1}
            >
              <IconChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-sm font-medium">{page}</span>
              <span className="text-sm text-muted-foreground">
                of {pageCount}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
            >
              <IconChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pageCount)}
              disabled={page >= pageCount}
            >
              <IconChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
