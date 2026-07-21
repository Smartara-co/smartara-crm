"use client";

import { ActivityComposer } from "@/components/ActivityComposer";
import { addLeadActivity } from "@/app/actions/leads";
import type { TeamMember } from "@/lib/data/types";

export function LeadActivitySection({ leadId }: { leadId: string }) {
  return (
    <ActivityComposer
      onAdd={(content, type, actor: TeamMember) => addLeadActivity(leadId, content, type, actor)}
    />
  );
}
