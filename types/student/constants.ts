import { Clock, CheckCircle, XCircle, Star } from "lucide-react";

export const STATUS_CONFIG = {
  PENDING: {
    label: "En attente",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Acceptée",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Refusée",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: XCircle,
  },
  INTERVIEW: {
    label: "Entretien",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: Star,
  },
} as const;

export const CAT_COLORS: Record<string, { text: string; bg: string }> = {
  "Carrière":  { text: "text-blue-600",   bg: "bg-blue-50"   },
  "Études":    { text: "text-green-600",  bg: "bg-green-50"  },
  "Questions": { text: "text-amber-600",  bg: "bg-amber-50"  },
  "Idées":     { text: "text-pink-600",   bg: "bg-pink-50"   },
  "Général":   { text: "text-slate-600",  bg: "bg-slate-100" },
};

export const TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  "full-time":  { text: "text-blue-600",   bg: "bg-blue-50"   },
  "part-time":  { text: "text-emerald-600",bg: "bg-emerald-50"},
  "freelance":  { text: "text-violet-600", bg: "bg-violet-50" },
  "internship": { text: "text-amber-600",  bg: "bg-amber-50"  },
  "Stage":      { text: "text-amber-600",  bg: "bg-amber-50"  },
  "Part-time":  { text: "text-emerald-600",bg: "bg-emerald-50"},
  "Full-time":  { text: "text-blue-600",   bg: "bg-blue-50"   },
  "Freelance":  { text: "text-violet-600", bg: "bg-violet-50" },
};
