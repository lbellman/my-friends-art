"use client";

import {
  PRINT_QUALITY_LABELS,
  type PrintQualityTier,
} from "@/lib/print-dimensions";
import { cn } from "@/lib/utils";

function tierChipClasses(tier: PrintQualityTier): string {
  switch (tier) {
    case "low":
      return "bg-red-100 text-red-700";
    case "good":
      return "bg-amber-100 text-amber-700";
    case "high":
      return "bg-blue-100 text-blue-700";
    case "highest":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export type QualityChipProps = {
  tier: PrintQualityTier;
  className?: string;
  children?: React.ReactNode;
};

export default function QualityChip({
  tier,
  className,
  children,
}: QualityChipProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tierChipClasses(tier),
        className,
      )}
    >
      {children ?? PRINT_QUALITY_LABELS[tier]}
    </span>
  );
}
