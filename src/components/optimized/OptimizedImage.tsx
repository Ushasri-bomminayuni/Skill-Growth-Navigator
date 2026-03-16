"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ComponentProps<typeof Image> {
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt = "",
  width = 500,
  height = 300,
  className,
  placeholder = "empty",
  blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      placeholder={placeholder === "blur" ? "blur" : "empty"}
      blurDataURL={blurDataURL}
      loading="lazy"
      quality={85}
      {...props}
    />
  );
}