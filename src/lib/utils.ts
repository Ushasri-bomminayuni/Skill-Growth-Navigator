import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate days until deadline
export function daysUntil(deadline: Date): number {
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Format date for display
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Calculate compatibility score (placeholder - will be replaced with AI logic)
export function calculateCompatibilityScore(userSkills: string[], opportunitySkills: string[]): number {
  if (opportunitySkills.length === 0) return 0;

  const matchingSkills = userSkills.filter(skill =>
    opportunitySkills.includes(skill)
  );

  return Math.round((matchingSkills.length / opportunitySkills.length) * 100);
}