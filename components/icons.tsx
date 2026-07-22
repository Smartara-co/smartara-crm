"use client";
// lucide-react calls React.createContext() at module scope, which throws when
// evaluated in a Server Component's module graph — re-export through a client
// boundary so Server Components can still render these icons.
export {
  TrendingUp,
  Users,
  CircleDollarSign,
  ArrowLeft,
  Briefcase,
  Building2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
