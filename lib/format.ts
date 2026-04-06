/**
 * Pure formatting utilities for BridgeReport.org
 * Safe to use in both server and client components (no Node.js dependencies)
 */

/** Format large numbers with commas */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString('en-US');
}

/** Format percentage to one decimal */
export function formatPct(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return 'N/A';
  return pct.toFixed(1) + '%';
}

/** Generate URL-safe slug from text */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
