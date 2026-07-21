"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/BrandMark";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4" style={{ background: "var(--color-navy)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <BrandMark size={32} />
            <span className="font-display text-xl font-bold text-white">
              Smart<span style={{ color: "var(--color-orange)" }}>ara</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--color-ink-faint)" }}>
            Get More Customers. Save More Time.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6 space-y-4"
          style={{ background: "var(--color-surface)" }}
        >
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-600"
              style={{ borderColor: "var(--color-line)" }}
              placeholder="you@smartara.co"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-600"
              style={{ borderColor: "var(--color-line)" }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ background: "var(--color-red-soft)", color: "var(--color-red)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
            style={{ background: "var(--color-orange)" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "var(--color-ink-faint)" }}>
          Internal tool — accounts are added by an admin in Supabase, no
          public signup.
        </p>
      </div>
    </div>
  );
}
