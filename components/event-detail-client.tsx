"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { withCSRF } from "@/lib/csrf";

type EventDetail = {
  id: string;
  slug: string;
  title: string;
  date: string;
  city: string | null;
  venue: string | null;
  image?: string | null;
  capacity: number;
  registered: number;
  description: string | null;
  topics: string[];
  speakers: { name: string; title: string | null; topic: string | null }[];
};

type InitialProfile = {
  isLoggedIn: boolean;
  profileCompleted: boolean;
  name: string;
  email: string;
} | null;

export function EventDetailClient({
  event,
  initialProfile,
  initialMyRsvp,
}: {
  event: EventDetail;
  initialProfile: InitialProfile;
  initialMyRsvp: boolean;
}) {
  const dt = new Date(event.date);

  return (
    <>
      {/* Hero flyer */}
      <div className="mb-8">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border">
          <Image
            src={event.image || "/event-flyer-placeholder.svg"}
            alt={`${event.title} flyer`}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div className="mb-8 space-y-3">
        <Badge variant="secondary" className="gap-2 px-4 py-1.5 text-sm">
          <Calendar className="h-4 w-4" />
          {dt.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Badge>
        <h1 className="text-h2 text-foreground">{event.title}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            {event.venue} - {event.city}
          </span>
        </div>
        <div className="pt-1">
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.venue || "") + ", " + (event.city || ""))}`}
            className="text-sm text-blue-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps
          </Link>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-3">
            <h2 className="text-h4 text-foreground">Sessions</h2>
            <ul className="space-y-2">
              {event.topics.map((t) => {
                const byTopic = event.speakers.filter((s) => s.topic === t);
                return (
                  <li
                    key={t}
                    className="rounded-lg border border-border bg-white/5 p-3"
                  >
                    <div className="font-semibold text-foreground">{t}</div>
                    <div className="text-sm text-muted-foreground">
                      {byTopic.length > 0
                        ? byTopic.map((s) => s.name).join(", ")
                        : "TBA"}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-h4 text-foreground">Speakers</h2>
            <ul className="space-y-2">
              {event.speakers.map((s) => (
                <li key={s.name} className="flex items-start gap-3">
                  <Users className="mt-1 h-4 w-4 text-blue-400" />
                  <div>
                    <div className="font-semibold text-foreground">
                      {s.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.title} - {s.topic}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-border bg-card card-padding">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Registration</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {event.registered}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              people have registered
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white/5 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Registration is open to everyone. After review, organizers will
              send invitations to selected participants.
              {event.capacity > 0 &&
                ` Expected capacity: ${event.capacity} attendees.`}
            </p>
          </div>
          <RSVPForm
            slug={event.slug}
            title={event.title}
            initialProfile={initialProfile}
            initialMyRsvp={initialMyRsvp}
          />
        </aside>
      </section>
    </>
  );
}

function RSVPForm({
  slug,
  title: _title,
  initialProfile,
  initialMyRsvp,
}: {
  slug: string;
  title: string;
  initialProfile: InitialProfile;
  initialMyRsvp: boolean;
}) {
  // CSR-03 fix: Use server-provided data instead of client fetches
  const [name, setName] = useState(initialProfile?.name || "");
  const [email, setEmail] = useState(initialProfile?.email || "");
  const [affiliation, setAffiliation] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [myRsvp, setMyRsvp] = useState(initialMyRsvp);
  const [isLoggedIn] = useState(initialProfile?.isLoggedIn || false);
  const [profileCompleted] = useState(
    initialProfile?.profileCompleted || false,
  );

  // No useEffect fetches needed - all data provided by server!

  const isOneClick = isLoggedIn && profileCompleted && !!name && !!email;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setStatus(null);
    if (!agree) {
      setStatus({ ok: false, msg: "Please accept the Code of Conduct" });
      return;
    }
    try {
      setLoading(true);
      const opts: RequestInit = isOneClick
        ? {
            method: "POST",
            headers: withCSRF({ "Content-Type": "application/json" }),
          } // one-click, no body
        : {
            method: "POST",
            headers: withCSRF({ "Content-Type": "application/json" }),
            body: JSON.stringify({ name, email, affiliation }),
          };
      const res = await fetch(`/api/events/${slug}/rsvp`, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to RSVP");
      setStatus({
        ok: true,
        msg: data.duplicate
          ? "You have already registered."
          : "Thanks! Your registration is received. We will notify selected participants via email.",
      });
      if (!data.duplicate) {
        setAffiliation("");
        setAgree(false);
        setMyRsvp(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to RSVP";
      setStatus({ ok: false, msg });
    } finally {
      setLoading(false);
    }
  }

  async function cancel() {
    setStatus(null);
    if (loading) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${slug}/rsvp`, {
        method: "DELETE",
        headers: withCSRF(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to cancel");
      setStatus({ ok: true, msg: "RSVP cancelled." });
      setMyRsvp(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to cancel";
      setStatus({ ok: false, msg });
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="pt-2 space-y-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-transparent"
          />
          <span>
            I agree to the{" "}
            <Link
              href="/code-of-conduct"
              className="text-blue-400 hover:underline"
            >
              Code of Conduct
            </Link>
          </span>
        </label>
        <Link
          href={`/signin?next=${encodeURIComponent(`/events/${slug}`)}`}
          className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
        >
          Log in to register
        </Link>
        {status && (
          <span
            className={`block text-sm ${status.ok ? "text-green-400" : "text-red-400"}`}
          >
            {status.msg}
          </span>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="pt-2 space-y-3">
      {isLoggedIn && !isOneClick && (
        <p className="text-xs text-yellow-400">
          {!profileCompleted ? (
            <>
              Complete your{" "}
              <Link href="/welcome" className="underline">
                profile
              </Link>{" "}
              to enable one-click registration.
            </>
          ) : (
            <>Please confirm your name and email below to register.</>
          )}
        </p>
      )}
      {/* Show fields only if one-click not available */}
      {!isOneClick && (
        <div className="grid gap-2">
          <div>
            <label htmlFor="rsvp-name" className="sr-only">
              Your Name
            </label>
            <input
              id="rsvp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              aria-label="Your name"
              className="h-9 w-full rounded-md border border-border bg-white/5 px-3 text-sm outline-none focus-visible:border-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/20"
            />
          </div>
          <div>
            <label htmlFor="rsvp-email" className="sr-only">
              Email Address
            </label>
            <input
              id="rsvp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              aria-label="Email address"
              className="h-9 w-full rounded-md border border-border bg-white/5 px-3 text-sm outline-none focus-visible:border-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/20"
            />
          </div>
          <div>
            <label htmlFor="rsvp-affiliation" className="sr-only">
              Affiliation (Optional)
            </label>
            <input
              id="rsvp-affiliation"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="Affiliation (optional)"
              aria-label="Affiliation"
              className="h-9 w-full rounded-md border border-border bg-white/5 px-3 text-sm outline-none focus-visible:border-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/20"
            />
          </div>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-transparent"
        />
        <span>
          I agree to the{" "}
          <Link
            href="/code-of-conduct"
            className="text-blue-400 hover:underline"
          >
            Code of Conduct
          </Link>
        </span>
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!agree || loading || myRsvp}
          className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          {loading
            ? "Submitting…"
            : myRsvp
              ? "Registered"
              : isLoggedIn && profileCompleted
                ? "Register"
                : "Register"}
        </button>
        {myRsvp && (
          <button
            type="button"
            onClick={cancel}
            disabled={loading}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Cancelling…" : "Cancel RSVP"}
          </button>
        )}
        {status && (
          <div
            role={status.ok ? "status" : "alert"}
            aria-live={status.ok ? "polite" : "assertive"}
            className={`text-sm ${status.ok ? "text-green-400" : "text-red-400"}`}
          >
            {status.msg}
          </div>
        )}
      </div>
    </form>
  );
}
