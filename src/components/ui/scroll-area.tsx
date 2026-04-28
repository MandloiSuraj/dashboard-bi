import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight scroll area — a styled wrapper that uses native scrollbars.
 * Avoids pulling in @radix-ui/react-scroll-area for this prototype.
 */
export const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
ScrollArea.displayName = "ScrollArea";
