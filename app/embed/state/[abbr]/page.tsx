/**
 * Embeddable State Bridge Widget
 * Shows key bridge statistics for a state
 */

import { notFound } from 'next/navigation';
import { getState, formatNumber, formatPct } from '@/lib/data';

// Widget themes
const THEMES = {
  light: {
    bg: 'bg-white',
    border: 'border-slate-200',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    accent: 'text-blue-600',
  },
  dark: {
    bg: 'bg-slate-900',
    border: 'border-slate-700',
    text: 'text-white',
    textMuted: 'text-slate-400',
    accent: 'text-blue-400',
  },
};

export const dynamic = 'force-dynamic';

export default async function StateWidget({
  params,
  searchParams,
}: {
  params: Promise<{ abbr: string }>;
  searchParams: Promise<{ theme?: string; compact?: string }>;
}) {
  const { abbr } = await params;
  const { theme: themeParam, compact } = await searchParams;

  const state = getState(abbr);
  if (!state) {
    notFound();
  }

  const theme = THEMES[themeParam === 'dark' ? 'dark' : 'light'];
  const isCompact = compact === 'true';
  const siteUrl = 'https://www.bridgereport.org';
  const stateUrl = `${siteUrl}/state/${abbr.toLowerCase()}`;

  if (isCompact) {
    // Compact single-line widget
    return (
      <div className={`${theme.bg} ${theme.border} border rounded-lg p-3 font-sans`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${theme.text}`}>{state.stateName}</span>
            <span className={`text-sm ${theme.textMuted}`}>
              {formatNumber(state.total)} bridges
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-green-600 font-bold">{formatPct(state.goodPct)}</span>
              <span className={`text-xs ${theme.textMuted} ml-1`}>good</span>
            </div>
            <div className="text-center">
              <span className="text-red-600 font-bold">{formatPct(state.poorPct)}</span>
              <span className={`text-xs ${theme.textMuted} ml-1`}>poor</span>
            </div>
          </div>
        </div>
        <div className={`text-xs ${theme.textMuted} mt-2 flex items-center justify-between`}>
          <span>Data: 2024 FHWA National Bridge Inventory</span>
          <a
            href={stateUrl}
            target="_blank"
            rel="noopener"
            className={`${theme.accent} hover:underline`}
          >
            BridgeReport.org
          </a>
        </div>
      </div>
    );
  }

  // Full widget
  return (
    <div className={`${theme.bg} ${theme.border} border rounded-xl p-5 font-sans max-w-sm`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className={`text-xl font-bold ${theme.text}`}>
            {state.stateName} Bridges
          </h2>
          <p className={`text-sm ${theme.textMuted}`}>
            {formatNumber(state.total)} highway bridges
          </p>
        </div>
        <span className={`text-3xl font-mono font-bold ${theme.textMuted}`}>
          {state.state}
        </span>
      </div>

      {/* Condition Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{formatPct(state.goodPct)}</p>
          <p className="text-xs text-green-700">Good</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{formatPct(state.fairPct)}</p>
          <p className="text-xs text-yellow-700">Fair</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{formatPct(state.poorPct)}</p>
          <p className="text-xs text-red-700">Poor</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`border-t ${theme.border} pt-3 mb-4`}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className={theme.textMuted}>Avg Age:</span>{' '}
            <span className={`font-medium ${theme.text}`}>
              {new Date().getFullYear() - state.avgYearBuilt} years
            </span>
          </div>
          <div>
            <span className={theme.textMuted}>Counties:</span>{' '}
            <span className={`font-medium ${theme.text}`}>{state.countyCount}</span>
          </div>
          <div>
            <span className={theme.textMuted}>Poor Bridges:</span>{' '}
            <span className={`font-medium ${theme.text}`}>{formatNumber(state.poor)}</span>
          </div>
          <div>
            <span className={theme.textMuted}>Daily Crossings:</span>{' '}
            <span className={`font-medium ${theme.text}`}>{formatNumber(state.totalDailyCrossings)}</span>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className={`border-t ${theme.border} pt-3 flex items-center justify-between`}>
        <span className={`text-xs ${theme.textMuted}`}>
          2024 FHWA Data
        </span>
        <a
          href={stateUrl}
          target="_blank"
          rel="noopener"
          className={`text-sm font-medium ${theme.accent} hover:underline flex items-center gap-1`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View on BridgeReport.org
        </a>
      </div>
    </div>
  );
}
