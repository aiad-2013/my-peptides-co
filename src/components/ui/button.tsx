import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent/5 hover:border-accent/50 hover:text-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "hover:bg-muted text-muted-foreground hover:text-foreground",
        link: "text-accent underline-offset-4 hover:underline",
        /* Primary action — clean teal, no gradient noise */
        gold: "bg-accent text-accent-foreground font-medium tracking-wide hover:bg-accent/90 hover:shadow-[0_4px_20px_-4px_hsl(var(--accent)/0.35)] active:scale-[0.99]",
        "gold-outline": "border border-accent/60 text-accent hover:bg-accent hover:text-accent-foreground font-medium tracking-wide",
        navy: "bg-primary text-primary-foreground font-medium tracking-wide hover:bg-primary/90",
        /* Hero CTA — same restrained teal */
        hero: "bg-accent/55 backdrop-blur-sm text-accent-foreground font-medium tracking-wide text-base px-8 py-5 hover:bg-accent/75 hover:shadow-[0_6px_28px_-6px_hsl(var(--accent)/0.4)] active:scale-[0.99]",
        "hero-outline": "bg-white/50 backdrop-blur-sm border border-white/50 text-primary hover:bg-white/70 hover:text-primary font-medium text-base px-8 py-5 tracking-wide",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded px-3 text-xs",
        lg: "h-11 rounded px-8",
        xl: "h-14 rounded px-10 text-base py-4",
        icon: "h-10 w-10",
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
