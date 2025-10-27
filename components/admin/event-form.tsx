"use client";

import { useState } from "react";

export type EventFormValue = {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  date: string;
  city?: string;
  venue?: string;
  image?: string;
  capacity?: number;
  published?: boolean;
  topics?: string[];
  speakers?: { name: string; title?: string; topic?: string }[];
};

export function EventForm({
  initial,
  onSaved,
  mode = "create",
}: {
  initial?: Partial<EventFormValue>;
  onSaved?: () => void;
  mode?: "create" | "edit";
}) {
  const [form, setForm] = useState<EventFormValue>({
    slug: initial?.slug || "",
    title: initial?.title || "",
    description: initial?.description || "",
    date: initial?.date || new Date().toISOString().slice(0, 16),
    city: initial?.city || "",
    venue: initial?.venue || "",
    image: initial?.image || "",
    capacity: initial?.capacity || 0,
    published: initial?.published || false,
    topics: initial?.topics || [],
    speakers: initial?.speakers || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof EventFormValue>(key: K, val: EventFormValue[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        mode === "create" ? "/api/events" : `/api/events/${form.slug}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            date: new Date(form.date).toISOString(),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      onSaved?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="event-slug" className="sr-only">
            Event Slug
          </label>
          <input
            id="event-slug"
            required
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="slug (kebab-case)"
            className="h-9 w-full rounded-md border border-border bg-surface-subtle px-3 text-sm"
            aria-label="Event slug (kebab-case)"
          />
        </div>
        <div>
          <label htmlFor="event-title" className="sr-only">
            Event Title
          </label>
          <input
            id="event-title"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="title"
            className="h-9 w-full rounded-md border border-border bg-surface-subtle px-3 text-sm"
            aria-label="Event title"
          />
        </div>
        <div>
          <label htmlFor="event-date" className="sr-only">
            Event Date & Time
          </label>
          <input
            id="event-date"
            required
            type="datetime-local"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-surface-subtle px-3 text-sm"
            aria-label="Event date and time"
          />
        </div>
        <div>
          <label htmlFor="event-city" className="sr-only">
            City
          </label>
          <input
            id="event-city"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="city"
            className="h-9 w-full rounded-md border border-border bg-surface-subtle px-3 text-sm"
            aria-label="City"
          />
        </div>
        <div>
          <label htmlFor="event-venue" className="sr-only">
            Venue
          </label>
          <input
            id="event-venue"
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
            placeholder="venue"
            className="h-9 w-full rounded-md border border-border bg-surface-subtle px-3 text-sm"
            aria-label="Venue name"
          />
        </div>
        <div>
          <label htmlFor="event-image" className="sr-only">
            Image URL
          </label>
          <input
            id="event-image"
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            placeholder="image url"
            className="h-9 w-full rounded-md border border-border bg-surface-subtle px-3 text-sm"
            aria-label="Event image URL"
          />
        </div>
        <div>
          <label htmlFor="event-capacity" className="sr-only">
            Capacity
          </label>
          <input
            id="event-capacity"
            type="number"
            min={0}
            value={form.capacity}
            onChange={(e) => set("capacity", Number(e.target.value))}
            placeholder="capacity"
            className="h-9 w-full rounded-md border border-border bg-surface-subtle px-3 text-sm"
            aria-label="Event capacity"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={!!form.published}
            onChange={(e) => set("published", e.target.checked)}
            aria-label="Published status"
          />
          Published
        </label>
      </div>
      <div>
        <label htmlFor="event-description" className="sr-only">
          Description
        </label>
        <textarea
          id="event-description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="description"
          className="min-h-24 w-full rounded-md border border-border bg-surface-subtle px-3 py-2 text-sm"
          aria-label="Event description"
        />
      </div>
      <div className="grid gap-2">
        <div>
          <label htmlFor="event-topics" className="sr-only">
            Topics
          </label>
          <input
            id="event-topics"
            placeholder="topics (comma-separated)"
            value={(form.topics || []).join(", ")}
            onChange={(e) =>
              set(
                "topics",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            className="h-9 w-full rounded-md border border-border bg-surface-subtle px-3 text-sm"
            aria-label="Event topics (comma-separated)"
          />
        </div>
        <div>
          <label htmlFor="event-speakers" className="sr-only">
            Speakers
          </label>
          <input
            id="event-speakers"
            placeholder="speakers (Name|Title|Topic; ...)"
            value={(form.speakers || [])
              .map((s) => `${s.name}|${s.title || ""}|${s.topic || ""}`)
              .join("; ")}
            onChange={(e) => {
              const v = e.target.value;
              const parts = v
                .split(";")
                .map((p) => p.trim())
                .filter(Boolean);
              const sp = parts.map((p) => {
                const [name, title, topic] = p
                  .split("|")
                  .map((x) => x?.trim() || "");
                return { name, title, topic };
              });
              set("speakers", sp);
            }}
            className="h-9 w-full rounded-md border border-border bg-surface-subtle px-3 text-sm"
            aria-label="Event speakers (Name|Title|Topic; separated by semicolon)"
          />
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-400" role="alert">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving
          ? "Saving…"
          : mode === "create"
            ? "Create Event"
            : "Save Changes"}
      </button>
    </form>
  );
}
