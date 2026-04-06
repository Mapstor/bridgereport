/**
 * Ad Components Export
 *
 * Usage:
 *
 * 1. Wrap your app with AdProvider in layout.tsx
 * 2. Add <InContentAd /> between content sections
 * 3. Add <SidebarAd /> in sidebar layouts
 * 4. Add <StickyFooterAd /> in layout for mobile
 *
 * All components auto-hide when ads are disabled.
 * Enable ads by setting NEXT_PUBLIC_ADS_ENABLED=true
 */

export { default as AdProvider, useAds } from './AdProvider';
export { default as InContentAd } from './InContentAd';
export { default as SidebarAd } from './SidebarAd';
export { default as StickyFooterAd } from './StickyFooterAd';
