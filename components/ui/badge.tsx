import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-quick overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-transparent rounded-full shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground border-border rounded-full shadow-sm",
        outline:
          "bg-transparent text-primary border-primary/40 rounded-full hover:bg-primary/10",
        subtle: "bg-muted text-muted-foreground border-transparent rounded-lg",
        success: "bg-success/15 text-success border-success/30 rounded-full",
        warning: "bg-warning/15 text-warning border-warning/30 rounded-full",
        destructive:
          "bg-destructive/15 text-destructive border-destructive/30 rounded-full",
        info: "bg-info/15 text-info border-info/30 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
