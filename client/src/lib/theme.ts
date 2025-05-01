import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper for tailwind classnames
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define colors for consistent use in app
export const theme = {
  colors: {
    navy: {
      DEFAULT: "#1E3A8A", // --primary
      dark: "#172554",
      light: "#2563EB", // --chart-3
    },
    darkgray: {
      DEFAULT: "#1F2937", // --secondary
      light: "#374151",
      dark: "#111827", // --background
    },
    mutedred: {
      DEFAULT: "#991B1B", // --destructive
      light: "#B91C1C",
      dark: "#7F1D1D",
    },
    neoncyan: {
      DEFAULT: "#22D3EE", // --accent
      light: "#67E8F9",
      dark: "#06B6D4",
    },
  },
};

// Crime type to badge color mapping
export const crimeTypeColors: Record<string, { bg: string; text: string }> = {
  "Theft": { bg: "bg-orange-900", text: "text-orange-200" },
  "Assault": { bg: "bg-red-900", text: "text-red-200" },
  "Vandalism": { bg: "bg-purple-900", text: "text-purple-200" },
  "Fraud": { bg: "bg-yellow-900", text: "text-yellow-200" },
  "Cyber Crime": { bg: "bg-blue-900", text: "text-blue-200" },
};

// Arrest status to badge color mapping
export const arrestStatusColors: Record<string, { bg: string; text: string }> = {
  "Arrested": { bg: "bg-green-900", text: "text-green-200" },
  "No Arrest": { bg: "bg-red-900", text: "text-red-200" },
  "Pending": { bg: "bg-yellow-900", text: "text-yellow-200" },
};

// Sentiment to badge color mapping
export const sentimentColors: Record<string, { bg: string; text: string }> = {
  "Positive": { bg: "bg-green-900", text: "text-green-200" },
  "Negative": { bg: "bg-red-900", text: "text-red-200" },
  "Neutral": { bg: "bg-blue-900", text: "text-blue-200" },
};

// Chart colors for consistent use in charts
export const chartColors = [
  "hsl(var(--chart-1))", // Neon cyan
  "hsl(var(--chart-2))", // Muted red
  "hsl(var(--chart-3))", // Navy light
  "hsl(var(--chart-4))", // Green
  "hsl(var(--chart-5))", // Yellow
];
