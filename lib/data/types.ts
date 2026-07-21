export type Region = "gambia" | "international";
export type Currency = "GMD" | "USD";
export type Product =
  | "Blueprint"
  | "Prospect"
  | "Content OS"
  | "Client Services"
  | "Custom Build";
export type LeadSource =
  | "WhatsApp Referral"
  | "LinkedIn"
  | "Website"
  | "Cold Outreach"
  | "Referral"
  | "Upwork/Fiverr"
  | "Other";
export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";
export type ClientStatus = "active" | "paused" | "completed" | "churned";
export type ProjectStatus =
  | "scoping"
  | "in_progress"
  | "review"
  | "delivered"
  | "on_hold";
export type ActivityType =
  | "call"
  | "email"
  | "whatsapp"
  | "meeting"
  | "note"
  | "stage_change";
export type TeamMember = "Muhammed" | "Rohey";

export interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  region: Region;
  currency: Currency;
  estimated_value: number;
  product_interest: Product;
  stage: LeadStage;
  assigned_to: TeamMember;
  lost_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  region: Region;
  status: ClientStatus;
  converted_from_lead: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  product: Product;
  status: ProjectStatus;
  value: number;
  currency: Currency;
  start_date: string | null;
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  related_type: "lead" | "client" | "project";
  related_id: string;
  type: ActivityType;
  content: string;
  created_by: TeamMember;
  created_at: string;
}

export const LEAD_STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal_sent", label: "Proposal Sent" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

export const LEAD_SOURCES: LeadSource[] = [
  "WhatsApp Referral",
  "LinkedIn",
  "Website",
  "Cold Outreach",
  "Referral",
  "Upwork/Fiverr",
  "Other",
];

export const PRODUCTS: Product[] = [
  "Blueprint",
  "Prospect",
  "Content OS",
  "Client Services",
  "Custom Build",
];

export const CLIENT_STATUSES: ClientStatus[] = [
  "active",
  "paused",
  "completed",
  "churned",
];

export const PROJECT_STATUSES: { key: ProjectStatus; label: string }[] = [
  { key: "scoping", label: "Scoping" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "delivered", label: "Delivered" },
  { key: "on_hold", label: "On Hold" },
];

export const TEAM_MEMBERS: TeamMember[] = ["Muhammed", "Rohey"];

export function formatMoney(amount: number, currency: Currency): string {
  const symbol = currency === "USD" ? "$" : "D";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return currency === "USD" ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count}${label} ago`;
  }
  return "just now";
}
