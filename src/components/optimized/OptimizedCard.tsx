"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LazyLoad } from "./LazyLoad";

interface OptimizedCardProps extends React.ComponentProps<typeof Card> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  lazyLoad?: boolean;
}

export function OptimizedCard({
  children,
  className,
  title,
  description,
  footer,
  lazyLoad = false,
  ...props
}: OptimizedCardProps) {
  const cardContent = (
    <Card className={cn("hover:shadow-lg transition-shadow duration-300", className)} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );

  if (lazyLoad) {
    return (
      <LazyLoad>
        {cardContent}
      </LazyLoad>
    );
  }

  return cardContent;
}