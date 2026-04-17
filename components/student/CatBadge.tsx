import { CAT_COLORS } from "@/types/student/constants";
import { cn } from "@/lib/utils";

interface CatBadgeProps {
  cat: string;
}

export function CatBadge({ cat }: CatBadgeProps) {
  const cfg = CAT_COLORS[cat] ?? CAT_COLORS["Général"];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", cfg.text, cfg.bg)}>
      {cat}
    </span>
  );
}
