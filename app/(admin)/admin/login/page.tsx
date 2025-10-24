"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setStatus("Logged in. You can now open /admin/events");
    } catch (e: any) {
      setStatus(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="px-4 lg:px-6 section-spacing-sm">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card card-padding space-y-4">
        <h1 className="text-h2 text-foreground">Admin Login</h1>
        <p className="text-sm text-muted-foreground">
          Paste the server admin token to authenticate this browser for admin
          APIs.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Admin token"
            className="h-10 w-full rounded-md border border-border bg-white/5 px-3 text-sm outline-none focus-visible:border-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/20"
          />
          <button
            disabled={loading || !token}
            className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
          {status && (
            <div className="text-sm text-muted-foreground">{status}</div>
          )}
        </form>
      </div>
    </div>
  );
}
