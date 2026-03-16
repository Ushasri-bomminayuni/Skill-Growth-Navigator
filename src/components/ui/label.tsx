"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Root } from "@radix-ui/react-label";

const Label = forwardRef<React.ElementRef<typeof Root>, React.ComponentPropsWithoutRef<typeof Root>>(
  ({ className, ...props }, ref) => (
    <Root
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);

Label.displayName = Root.displayName;

export { Label };