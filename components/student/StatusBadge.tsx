import { STATUS_CONFIG } from "@/types/student/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: keyof typeof STATUS_CONFIG;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cfg.color, cfg.bg, cfg.border)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}
