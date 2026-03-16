"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, XCircle, AlertTriangle, Info } from "lucide-react";

const toastVariants = cva(
  "flex items-center gap-4 p-4 rounded-lg shadow-lg border",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        destructive: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
        success: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
        warning: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Toast({
  title,
  description,
  variant = "default",
  onDismiss,
}: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  onDismiss?: () => void;
}) {
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "success":
        return <Check className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className={cn(toastVariants({ variant }))}>
      {getIcon()}
      <div className="flex-1">
        {title && <div className="font-medium">{title}</div>}
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}