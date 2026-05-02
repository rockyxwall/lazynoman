import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex items-center font-mono text-[11px] font-semibold tracking-wider px-2 py-0.5 rounded-[calc(var(--radius)*0.7)] border transition-all cursor-default select-none",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-muted-foreground border-border hover:text-primary hover:border-primary/45",
        secondary:
          "bg-muted/50 text-muted-foreground border-border/50 hover:text-primary hover:border-primary/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

function Tag({ className, variant, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ variant }), className)} {...props} />
  )
}

export { Tag, tagVariants }
