"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { REGIONS, CLIENT_STATUSES } from "@/lib/data/types";

export function ClientFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: "region" | "status", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/clients?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <select
        aria-label="Filter by region"
        value={searchParams.get("region") ?? ""}
        onChange={(e) => updateParam("region", e.target.value)}
        className="rounded-lg border px-2.5 py-1.5 text-xs bg-white"
        style={{ borderColor: "var(--color-line)" }}
      >
        <option value="">All regions</option>
        {REGIONS.map((r) => (
          <option key={r.key} value={r.key}>
            {r.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by status"
        value={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className="rounded-lg border px-2.5 py-1.5 text-xs bg-white capitalize"
        style={{ borderColor: "var(--color-line)" }}
      >
        <option value="">All statuses</option>
        {CLIENT_STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">
            {s}
          </option>
        ))}
      </select>

      {(searchParams.get("region") || searchParams.get("status")) && (
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("region");
            params.delete("status");
            router.push(`/clients?${params.toString()}`);
          }}
          className="text-xs font-medium hover:underline"
          style={{ color: "var(--color-ink-muted)" }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
