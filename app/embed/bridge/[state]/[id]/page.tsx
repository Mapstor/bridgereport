/**
 * Embeddable Individual Bridge Widget
 * Shows key information for a specific bridge
 */

import { notFound } from 'next/navigation';
import { getBridge, getCountyName, formatNumber } from '@/lib/data';

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

const CONDITION_COLORS = {
  good: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'bg-green-900/30', darkText: 'text-green-400' },
  fair: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'bg-yellow-900/30', darkText: 'text-yellow-400' },
  poor: { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'bg-red-900/30', darkText: 'text-red-400' },
};

export const dynamic = 'force-dynamic';

export default async function BridgeWidget({
  params,
  searchParams,
}: {
  params: Promise<{ state: string; id: string }>;
  searchParams: Promise<{ theme?: string; compact?: string }>;
}) {
  const { state, id } = await params;
  const { theme: themeParam, compact } = await searchParams;

  const bridge = getBridge(state, id);
  if (!bridge) {
    notFound();
  }

  const countyName = getCountyName(state, bridge.countyFips);
  const theme = THEMES[themeParam === 'dark' ? 'dark' : 'light'];
  const isDark = themeParam === 'dark';
  const isCompact = compact === 'true';
  const siteUrl = 'https://bridgereport.org';
  const bridgeUrl = `${siteUrl}/bridge/${state.toLowerCase()}/${id}`;

  const conditionColors = bridge.conditionCategory
    ? CONDITION_COLORS[bridge.conditionCategory]
    : null;

  const conditionLabel = bridge.conditionCategory
    ? bridge.conditionCategory.charAt(0).toUpperCase() + bridge.conditionCategory.slice(1)
    : 'Unknown';

  const age = bridge.yearBuilt ? new Date().getFullYear() - bridge.yearBuilt : null;

  if (isCompact) {
    return (
      <div className={`${theme.bg} ${theme.border} border rounded-lg p-3 font-sans`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`text-lg font-bold ${theme.text} truncate`}>
              {bridge.facilityCarried}
            </span>
            {conditionColors && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  isDark
                    ? `${conditionColors.darkBg} ${conditionColors.darkText}`
                    : `${conditionColors.bg} ${conditionColors.text}`
                }`}
              >
                {conditionLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {bridge.yearBuilt && (
              <span className={`text-sm ${theme.textMuted}`}>Built {bridge.yearBuilt}</span>
            )}
          </div>
        </div>
        <div className={`text-xs ${theme.textMuted} mt-2 flex items-center justify-between`}>
          <span>
            {bridge.stateName}
            {countyName && ` · ${countyName}`}
          </span>
          <a
            href={bridgeUrl}
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

  return (
    <div className={`${theme.bg} ${theme.border} border rounded-xl p-5 font-sans max-w-sm`}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className={`text-xl font-bold ${theme.text} leading-tight`}>
            {bridge.facilityCarried}
          </h2>
          {conditionColors && (
            <span
              className={`px-2 py-1 rounded text-sm font-medium flex-shrink-0 ${
                isDark
                  ? `${conditionColors.darkBg} ${conditionColors.darkText}`
                  : `${conditionColors.bg} ${conditionColors.text}`
              }`}
            >
              {conditionLabel}
            </span>
          )}
        </div>
        <p className={`text-sm ${theme.textMuted} mt-1`}>
          Over {bridge.featuresIntersected}
        </p>
        <p className={`text-sm ${theme.textMuted}`}>
          {countyName && `${countyName}, `}{bridge.stateName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 gap-3 mb-4`}>
        {bridge.yearBuilt && (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-3`}>
            <p className={`text-2xl font-bold ${theme.text}`}>{bridge.yearBuilt}</p>
            <p className={`text-xs ${theme.textMuted}`}>Year Built</p>
          </div>
        )}
        {age !== null && (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-3`}>
            <p className={`text-2xl font-bold ${theme.text}`}>{age}</p>
            <p className={`text-xs ${theme.textMuted}`}>Years Old</p>
          </div>
        )}
        {bridge.lengthFt && (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-3`}>
            <p className={`text-2xl font-bold ${theme.text}`}>{formatNumber(bridge.lengthFt)}</p>
            <p className={`text-xs ${theme.textMuted}`}>Length (ft)</p>
          </div>
        )}
        {bridge.adt && (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-3`}>
            <p className={`text-2xl font-bold ${theme.text}`}>{formatNumber(bridge.adt)}</p>
            <p className={`text-xs ${theme.textMuted}`}>Daily Traffic</p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className={`border-t ${theme.border} pt-3 mb-4`}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {bridge.materialName && (
            <div>
              <span className={theme.textMuted}>Material:</span>{' '}
              <span className={`font-medium ${theme.text}`}>{bridge.materialName}</span>
            </div>
          )}
          {bridge.designTypeName && (
            <div>
              <span className={theme.textMuted}>Design:</span>{' '}
              <span className={`font-medium ${theme.text}`}>{bridge.designTypeName}</span>
            </div>
          )}
          {bridge.lowestRating !== null && (
            <div>
              <span className={theme.textMuted}>Rating:</span>{' '}
              <span className={`font-medium ${theme.text}`}>{bridge.lowestRating}/9</span>
            </div>
          )}
          {bridge.ownerName && (
            <div>
              <span className={theme.textMuted}>Owner:</span>{' '}
              <span className={`font-medium ${theme.text}`}>{bridge.ownerName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Attribution */}
      <div className={`border-t ${theme.border} pt-3 flex items-center justify-between`}>
        <span className={`text-xs ${theme.textMuted}`}>2024 FHWA Data</span>
        <a
          href={bridgeUrl}
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
