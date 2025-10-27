"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { withCSRF } from "@/lib/csrf";
import { toast } from "sonner";
import { PostInput } from "@/lib/validation";
import { ImageUpload } from "@/components/admin/image-upload";

export type Post = {
  slug: string;
  title: string;
  excerpt?: string | null;
  category?: string | null;
  image?: string | null;
  date?: string | null;
  author?: string | null;
  tags?: string | string[] | null;
  content?: string | string[] | null;
};

export function PostForm({
  mode,
  initial,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: Post | null;
  onSaved?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState<Post>(() => ({
    slug: initial?.slug || "",
    title: initial?.title || "",
    excerpt: initial?.excerpt || "",
    category: initial?.category || "",
    image: initial?.image || "",
    date: initial?.date || "",
    author: initial?.author || "",
    tags: Array.isArray(initial?.tags)
      ? initial?.tags.join(",")
      : initial?.tags || "",
    content: Array.isArray(initial?.content)
      ? initial?.content.join("\n\n")
      : initial?.content || "",
  }));

  // Autosave draft to localStorage
  const draftKey = `post-draft:${mode}:${initial?.slug || "new"}`;
  useEffect(() => {
    // load draft on mount (only for create mode or when no initial)
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        setForm((prev) => ({ ...prev, ...draft }));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(form));
    } catch {}
  }, [form, draftKey]);

  function clearDraft() {
    try {
      localStorage.removeItem(draftKey);
    } catch {}
  }

  function collectErrors(payload: any) {
    const result = PostInput.safeParse(payload);
    if (result.success) {
      setFormErrors({});
      return null;
    }
    const errs: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (!errs[key]) errs[key] = issue.message;
    }
    setFormErrors(errs);
    return errs;
  }

  useEffect(() => {
    if (!initial) return;
    setForm({
      slug: initial.slug || "",
      title: initial.title || "",
      excerpt: initial.excerpt || "",
      category: initial.category || "",
      image: initial.image || "",
      date: initial.date || "",
      author: initial.author || "",
      tags: Array.isArray(initial.tags)
        ? initial.tags.join(",")
        : initial.tags || "",
      content: Array.isArray(initial.content)
        ? initial.content.join("\n\n")
        : initial.content || "",
    });
  }, [initial?.slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Normalize optional empty strings to undefined for validation
      const payload = {
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt || undefined,
        category: form.category || undefined,
        image: form.image || undefined,
        date: form.date || undefined,
        author: form.author || undefined,
        tags: form.tags || undefined,
        content: form.content || undefined,
      };
      const errs = collectErrors(payload);
      if (errs) {
        const msg = "Validation failed. Please fix the highlighted fields.";
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }
      if (mode === "create") {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: withCSRF({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to create post");
        toast.success("Post created");
      } else if (mode === "edit" && initial) {
        const res = await fetch(`/api/posts/${initial.slug}`, {
          method: "PATCH",
          headers: withCSRF({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to update post");
        toast.success("Post updated");
      }
      clearDraft();
      onSaved?.();
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const tagList = useMemo(
    () =>
      String(form.tags || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [form.tags],
  );

  return (
    <form onSubmit={submit} className="grid gap-4">
      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={showPreview ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPreview((p) => !p)}
        >
          {showPreview ? "Hide Preview" : "Preview"}
        </Button>
      </div>
      {!showPreview ? (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="slug">
              Slug{" "}
              {mode === "edit" ? (
                <span className="text-xs text-muted-foreground">
                  (read-only)
                </span>
              ) : null}
            </Label>
            <Input
              id="slug"
              required
              aria-invalid={!!formErrors.slug}
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              onBlur={() =>
                collectErrors({
                  ...form,
                  tags: form.tags || undefined,
                  content: form.content || undefined,
                })
              }
              disabled={mode === "edit"}
              placeholder="my-post-slug"
            />
            {formErrors.slug && (
              <div className="text-xs text-red-400">{formErrors.slug}</div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              aria-invalid={!!formErrors.title}
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              onBlur={() =>
                collectErrors({
                  ...form,
                  tags: form.tags || undefined,
                  content: form.content || undefined,
                })
              }
              placeholder="My Post Title"
            />
            {formErrors.title && (
              <div className="text-xs text-red-400">{formErrors.title}</div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              aria-invalid={!!formErrors.category}
              value={form.category || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              onBlur={() =>
                collectErrors({
                  ...form,
                  tags: form.tags || undefined,
                  content: form.content || undefined,
                })
              }
              placeholder="news, update, ..."
            />
            {formErrors.category && (
              <div className="text-xs text-red-400">{formErrors.category}</div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              aria-invalid={!!formErrors.date}
              value={form.date || ""}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              onBlur={() =>
                collectErrors({
                  ...form,
                  tags: form.tags || undefined,
                  content: form.content || undefined,
                })
              }
              placeholder="YYYY-MM-DD"
            />
            {formErrors.date && (
              <div className="text-xs text-red-400">{formErrors.date}</div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              aria-invalid={!!formErrors.author}
              value={form.author || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, author: e.target.value }))
              }
              onBlur={() =>
                collectErrors({
                  ...form,
                  tags: form.tags || undefined,
                  content: form.content || undefined,
                })
              }
              placeholder="Author Name"
            />
            {formErrors.author && (
              <div className="text-xs text-red-400">{formErrors.author}</div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              aria-invalid={!!formErrors.image}
              value={form.image || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, image: e.target.value }))
              }
              onBlur={() =>
                collectErrors({
                  ...form,
                  tags: form.tags || undefined,
                  content: form.content || undefined,
                })
              }
              placeholder="https://..."
            />
            <ImageUpload
              value={form.image || ""}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              label="Upload image"
            />
            {formErrors.image && (
              <div className="text-xs text-red-400">{formErrors.image}</div>
            )}
          </div>
          <div className="md:col-span-2 grid gap-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              aria-invalid={!!formErrors.excerpt}
              value={form.excerpt || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, excerpt: e.target.value }))
              }
              onBlur={() =>
                collectErrors({
                  ...form,
                  tags: form.tags || undefined,
                  content: form.content || undefined,
                })
              }
              placeholder="Short summary"
              rows={3}
            />
            {formErrors.excerpt && (
              <div className="text-xs text-red-400">{formErrors.excerpt}</div>
            )}
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={String(form.tags || "")}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="kubernetes, cncf, devops"
            />
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {tagList.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-2 grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              aria-invalid={!!formErrors.content}
              value={String(form.content || "")}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              onBlur={() =>
                collectErrors({
                  ...form,
                  tags: form.tags || undefined,
                  content: form.content || undefined,
                })
              }
              placeholder={
                "Markdown or text. Separate paragraphs with blank lines."
              }
              rows={12}
            />
            {formErrors.content && (
              <div className="text-xs text-red-400">{formErrors.content}</div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="text-sm text-muted-foreground">Preview</div>
          <div className="space-y-2">
            <div className="text-xl font-semibold">
              {form.title || "Untitled"}
            </div>
            <div className="text-xs text-muted-foreground">
              {form.date || "No date"} {form.author ? `· ${form.author}` : ""}
            </div>
            {form.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.image}
                alt="cover"
                className="rounded-md border max-h-64 object-cover"
              />
            ) : null}
            {form.excerpt && <p className="text-sm">{form.excerpt}</p>}
            {String(form.content || "").trim() && (
              <pre className="whitespace-pre-wrap text-sm bg-white/5 rounded-md p-3 border">
                {String(form.content)}
              </pre>
            )}
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {tagList.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving
            ? "Saving…"
            : mode === "create"
              ? "Create Post"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
