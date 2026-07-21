"use client";

import type { Activity } from "@/lib/data/types";
import { timeAgo } from "@/lib/data/types";
import { Phone, Mail, MessageCircle, Calendar, StickyNote, GitCommitHorizontal } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  note: <StickyNote size={13} />,
  call: <Phone size={13} />,
  whatsapp: <MessageCircle size={13} />,
  email: <Mail size={13} />,
  meeting: <Calendar size={13} />,
  stage_change: <GitCommitHorizontal size={13} />,
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-xs py-4" style={{ color: "var(--color-ink-faint)" }}>
        No activity logged yet.
      </p>
    );
  }

  return (
    <ul className="space-y-4 mt-1">
      {activities.map((a) => (
        <li key={a.id} className="flex gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "var(--color-navy-soft)", color: "var(--color-ink-muted)" }}
          >
            {ICONS[a.type] ?? <StickyNote size={13} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">{a.content}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-ink-faint)" }}>
              {a.created_by} · {timeAgo(a.created_at)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
