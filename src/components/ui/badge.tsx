import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-crimson/10 text-crimson",
        secondary: "bg-surface text-muted border border-border",
        beginner: "bg-emerald-500/10 text-emerald-600",
        intermediate: "bg-amber-500/10 text-amber-600",
        advanced: "bg-violet-500/10 text-violet-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
