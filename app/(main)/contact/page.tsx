"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
} from "@/lib/sanitize";
import { withCSRF } from "@/lib/csrf";

const MAX_MESSAGE = 1200;
const MAX_ABSTRACT = 1800;

export default function ContactPage() {
  const params = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState("Email");
  const [phone, setPhone] = useState("");
  const [referrer, setReferrer] = useState("");

  // Speaking extras
  const [talkTitle, setTalkTitle] = useState("");
  const [talkAbstract, setTalkAbstract] = useState("");
  const [talkLink, setTalkLink] = useState("");

  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [hp, setHp] = useState(""); // honeypot

  const isSpeaking = topic === "Speaking";
  const messageCount = message.length;
  const abstractCount = talkAbstract.length;

  useEffect(() => {
    // Prefill via query params
    const qp = (key: string) => params.get(key) || "";
    const qpTopic = params.get("topic");
    if (qp("name")) setName(qp("name"));
    if (qp("email")) setEmail(qp("email"));
    if (qp("org")) setAffiliation(qp("org"));
    if (qpTopic) setTopic(qpTopic);
    if (qp("ref")) setReferrer(qp("ref"));
  }, [params]);

  function validate() {
    if (!name.trim()) return "Please enter your name";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email";
    if (!message.trim()) return "Please enter a message";
    if (message.length > MAX_MESSAGE)
      return `Message too long (max ${MAX_MESSAGE} chars)`;
    if (isSpeaking) {
      if (!talkTitle.trim()) return "Please add a talk title";
      if (!talkAbstract.trim()) return "Please add a talk abstract";
      if (talkAbstract.length > MAX_ABSTRACT)
        return `Abstract too long (max ${MAX_ABSTRACT} chars)`;
    }
    if (method === "Phone" && !phone.trim())
      return "Please add a phone number or choose Email";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const err = validate();
    if (err) {
      setStatus({ ok: false, msg: err });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const source = typeof window !== "undefined" ? window.location.href : "";

      // Sanitize all inputs before sending
      const sanitizedData = {
        name: sanitizeText(name),
        email: sanitizeEmail(email),
        affiliation: sanitizeText(affiliation),
        topic: sanitizeText(topic),
        message: sanitizeText(message),
        method: sanitizeText(method),
        phone: sanitizePhone(phone),
        referrer: sanitizeText(referrer),
        talk: isSpeaking
          ? {
              title: sanitizeText(talkTitle),
              abstract: sanitizeText(talkAbstract),
              link: sanitizeUrl(talkLink),
            }
          : undefined,
        hp,
        source,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: withCSRF({ "Content-Type": "application/json" }),
        body: JSON.stringify(sanitizedData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send");
      setStatus({ ok: true, msg: "Thanks! We'll be in touch soon." });
      setName("");
      setEmail("");
      setAffiliation("");
      setTopic("General");
      setMessage("");
      setMethod("Email");
      setPhone("");
      setReferrer("");
      setTalkTitle("");
      setTalkAbstract("");
      setTalkLink("");
    } catch (err: any) {
      setStatus({ ok: false, msg: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main
        id="main-content"
        className="container mx-auto px-4 pt-12 pb-20 space-y-16"
      >
        {/* Hero */}
        <section className="max-w-3xl">
          <h1 className="text-h1 text-foreground">Contact CNSL</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Speak at a meetup, volunteer at events, mentor through CNSL Connect,
            or partner with us. Have a question? Send us a message.
          </p>
        </section>

        {/* Quick topic chips */}
        <section className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            {[
              "General",
              "Speaking",
              "Volunteering",
              "Mentoring",
              "Partnerships",
              "Other",
            ].map((t) => (
              <Button
                key={t}
                type="button"
                size="sm"
                variant={t === topic ? undefined : "outline"}
                className={`${t === topic ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" : "border-white/20 text-white/90 hover:bg-white/5"} px-4`}
                onClick={() => setTopic(t)}
              >
                {t}
              </Button>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {topic === "Speaking" &&
              "Tip: Include a concise title, abstract (150-300 words), and optional slides/demo link."}
            {topic === "Volunteering" &&
              "Tell us what you’d like to help with (logistics, content, outreach, ops)."}
            {topic === "Mentoring" &&
              "Share your areas of expertise or interests (or if you’re seeking a mentor)."}
            {topic === "Partnerships" &&
              "Briefly describe your org and goals (sponsorships, hiring, campus, etc.)."}
            {topic === "General" &&
              "Ask us anything. We’ll route it to the right organizer."}
          </div>
        </section>

        {/* Ways to Engage */}
        <section className="space-y-6">
          <h2 className="text-h3 text-foreground">Ways to engage</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Speak", d: "Share your expertise at our meetups." },
              { t: "Volunteer", d: "Support logistics, content, and ops." },
              { t: "Mentor", d: "Guide learners through CNSL Connect." },
              { t: "Partner", d: "Collaborate on programs and hiring." },
            ].map((x) => (
              <Card key={x.t} className="border-border bg-card p-5">
                <div className="text-lg font-semibold text-foreground">
                  {x.t}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{x.d}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-2xl border border-border bg-card card-padding"
          >
            {/* Honeypot */}
            <input
              type="text"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="bg-white/5 border-border"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-white/5 border-border"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Affiliation / Organization
              </label>
              <Input
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="e.g. University, Company"
                className="bg-white/5 border-border"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Topic
                </label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger className="bg-white/5 border-border text-foreground">
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {[
                      "General",
                      "Speaking",
                      "Volunteering",
                      "Mentoring",
                      "Partnerships",
                      "Other",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Preferred Contact
                </label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="bg-white/5 border-border text-foreground">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {["Email", "Phone"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  How did you hear?
                </label>
                <Select value={referrer} onValueChange={setReferrer}>
                  <SelectTrigger className="bg-white/5 border-border text-foreground">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {[
                      "LinkedIn",
                      "Meetup",
                      "University",
                      "Friend",
                      "Search",
                      "Other",
                    ].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isSpeaking && (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Talk proposal
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    150-300 words is ideal
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Talk Title
                    </label>
                    <Input
                      value={talkTitle}
                      onChange={(e) => setTalkTitle(e.target.value)}
                      placeholder="Your session title"
                      className="bg-white/5 border-border"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Slides / Demo Link
                    </label>
                    <Input
                      type="url"
                      value={talkLink}
                      onChange={(e) => setTalkLink(e.target.value)}
                      placeholder="https://..."
                      className="bg-white/5 border-border"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Talk Abstract
                  </label>
                  <Textarea
                    value={talkAbstract}
                    onChange={(e) => setTalkAbstract(e.target.value)}
                    placeholder="Brief abstract of your talk"
                    className="min-h-[140px] bg-white/5 border-border"
                  />
                  <div
                    className={`mt-1 text-xs ${abstractCount > MAX_ABSTRACT ? "text-red-400" : "text-muted-foreground"}`}
                  >
                    {abstractCount}/{MAX_ABSTRACT}
                  </div>
                </div>
              </div>
            )}

            {method === "Phone" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +94 7X XXX XXXX"
                  className="bg-white/5 border-border"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Message
                </label>
                <span
                  className={`text-xs ${messageCount > MAX_MESSAGE ? "text-red-400" : "text-muted-foreground"}`}
                >
                  {messageCount}/{MAX_MESSAGE}
                </span>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                className="min-h-40 bg-white/5 border-border"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Sending..." : "Send message"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                  onClick={() => {
                    setName("");
                    setEmail("");
                    setAffiliation("");
                    setTopic("General");
                    setMessage("");
                    setMethod("Email");
                    setPhone("");
                    setReferrer("");
                    setTalkTitle("");
                    setTalkAbstract("");
                    setTalkLink("");
                    setStatus(null);
                  }}
                >
                  Clear
                </Button>
              </div>
              {status && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border transition-all ${
                    status.ok
                      ? "text-green-400 bg-green-500/10 border-green-500/20"
                      : "text-red-400 bg-red-500/10 border-red-500/20"
                  }`}
                >
                  {status.ok ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {status.msg}
                </div>
              )}
            </div>
          </form>

          <aside className="space-y-4 rounded-2xl border border-border bg-card card-padding lg:sticky lg:top-24 h-max">
            <div>
              <div className="text-sm text-muted-foreground">Prefer email?</div>
              <div className="text-foreground font-semibold">
                hello@cloudnative.lk
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              We notify our organizers via email and Telegram for quick
              responses.
            </div>
            <div className="text-sm text-muted-foreground">
              Response time: 1-3 business days.
            </div>
            <div className="pt-2 text-sm text-muted-foreground">
              By contacting us, you agree to our{" "}
              <a className="text-blue-400 hover:underline" href="/privacy">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                className="text-blue-400 hover:underline"
                href="/code-of-conduct"
              >
                Code of Conduct
              </a>
              .
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export const dynamic = "force-static";
