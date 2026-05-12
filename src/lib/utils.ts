import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL for a post based on its collection ID.
 * Expected ID format: "category/slug.mdx" or "category/sub/slug.mdx"
 * Returns: "/category/slug" or "/category/sub/slug"
 */
export function getPostUrl(postId: string) {
  const path = postId.replace(/\.[^/.]+$/, ""); // remove extension
  return `/${path}`;
}
