/**
 * Client-safe trend utilities
 * These functions can be imported in client components
 */

import type { TrendDirection, AggregateTrendData } from '@/types';

// Years covered by trend data
export const TREND_YEARS = [2020, 2021, 2022, 2023, 2024] as const;
export const BASELINE_YEAR = 2020;
export const CURRENT_YEAR = 2024;

/**
 * Get trend description text
 */
export function getTrendDescription(trend: TrendDirection, ratingChange: number): string {
  switch (trend) {
    case 'improving':
      return `Condition has improved by ${Math.abs(ratingChange).toFixed(1)} rating points since 2020`;
    case 'declining':
      return `Condition has declined by ${Math.abs(ratingChange).toFixed(1)} rating points since 2020`;
    case 'stable':
      return 'Condition has remained relatively stable since 2020';
    default:
      return 'Insufficient data to determine trend';
  }
}

/**
 * Get aggregate trend description
 */
export function getAggregateTrendDescription(trend: AggregateTrendData): string {
  const { trend: direction, changeFromBaseline } = trend;

  if (direction === 'improving') {
    return `Infrastructure is improving: poor bridges decreased by ${Math.abs(changeFromBaseline).toFixed(1)}% since 2020`;
  } else if (direction === 'declining') {
    return `Infrastructure is declining: poor bridges increased by ${Math.abs(changeFromBaseline).toFixed(1)}% since 2020`;
  }
  return 'Bridge conditions have remained relatively stable since 2020';
}
