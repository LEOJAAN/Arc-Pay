import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // base — shared across all variants
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        /** Electric blue gradient with shimmer + glow */
        default: "btn-electric text-white",
        /** Dark glass with blue border */
        outline: "btn-glass",
        /** Subtle muted fill */
        secondary:
          "bg-white/5 border border-white/8 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-premium",
        ghost:
          "text-slate-400 hover:bg-white/6 hover:text-slate-200 transition-premium",
        destructive:
          "bg-red-600/80 text-white hover:bg-red-500 shadow-sm transition-premium",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 px-3.5 text-xs rounded-lg",
        lg: "h-12 px-8 text-base rounded-xl",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
