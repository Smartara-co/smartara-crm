"use client";

import { useState, useTransition } from "react";
import type { TeamMember } from "@/lib/data/types";
import { Phone, Mail, MessageCircle, Calendar, StickyNote } from "lucide-react";

const TYPES: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: "note", label: "Note", icon: <StickyNote size={13} /> },
  { key: "call", label: "Call", icon: <Phone size={13} /> },
  { key: "whatsapp", label: "WhatsApp", icon: <MessageCircle size={13} /> },
  { key: "email", label: "Email", icon: <Mail size={13} /> },
  { key: "meeting", label: "Meeting", icon: <Calendar size={13} /> },
];

export function ActivityComposer({
  onAdd,
  defaultActor = "Muhammed",
}: {
  onAdd: (content: string, type: string, actor: TeamMember) => Promise<void>;
  defaultActor?: TeamMember;
}) {
  const [type, setType] = useState("note");
  const [content, setContent] = useState("");
  const [actor, setActor] = useState<TeamMember>(defaultActor);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!content.trim()) return;
    startTransition(async () => {
      await onAdd(content.trim(), type, actor);
      setContent("");
    });
  }

  return (
    <div className="rounded-lg p-3" style={{ border: "1px solid var(--color-line)" }}>
      <div className="flex gap-1.5 mb-2">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
            style={{
              background: type === t.key ? "var(--color-orange-soft)" : "transparent",
              color: type === t.key ? "var(--color-orange)" : "var(--color-ink-muted)",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        placeholder="Log what happened…"
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-2"
        style={{ borderColor: "var(--color-line)" }}
      />
      <div className="flex items-center justify-between">
        <select
          value={actor}
          onChange={(e) => setActor(e.target.value as TeamMember)}
          className="rounded-md border px-2 py-1 text-xs bg-white"
          style={{ borderColor: "var(--color-line)" }}
        >
          <option value="Muhammed">Muhammed</option>
          <option value="Rohey">Rohey</option>
        </select>
        <button
          onClick={submit}
          disabled={isPending || !content.trim()}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          style={{ background: "var(--color-orange)" }}
        >
          {isPending ? "Logging…" : "Log activity"}
        </button>
      </div>
    </div>
  );
}
