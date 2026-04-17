import { TYPE_COLORS } from "@/types/student/constants";
import { cn } from "@/lib/utils";

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const cfg = TYPE_COLORS[type] ?? { text: "text-slate-500", bg: "bg-slate-100" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", cfg.text, cfg.bg)}>
      {type}
    </span>
  );
}
