"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface LazyLoadProps extends React.HTMLAttributes<HTMLDivElement> {
  placeholder?: React.ReactNode;
  threshold?: number;
}

export function LazyLoad({
  children,
  className,
  placeholder = null,
  threshold = 0.1,
  ...props
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return (
    <div ref={containerRef} className={cn(className)} {...props}>
      {isVisible ? children : placeholder}
    </div>
  );
}