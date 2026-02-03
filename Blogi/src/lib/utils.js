import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("fi-FI", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
