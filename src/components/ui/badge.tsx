import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[#4f8cff]/10 border border-[#4f8cff]/25 text-[#4f8cff]",
        secondary:
          "bg-white/8 border border-white/15 text-[#b7c4d6]",
        outline:
          "badge-arc",
        success:
          "badge-live",
        warning:
          "bg-amber-500/15 border border-amber-500/30 text-amber-400",
        blue:
          "badge-arc",
        purple:
          "bg-[#6d5dfc]/15 border border-[#6d5dfc]/30 text-[#a599fd]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
