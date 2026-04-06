'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { ADS_CONFIG, shouldShowAds, getRaptiveScriptUrl } from '@/lib/ads';

interface AdContextType {
  adsEnabled: boolean;
  adsLoaded: boolean;
  showAdsOnPage: boolean;
}

const AdContext = createContext<AdContextType>({
  adsEnabled: false,
  adsLoaded: false,
  showAdsOnPage: false,
});

export function useAds() {
  return useContext(AdContext);
}

interface AdProviderProps {
  children: ReactNode;
}

export default function AdProvider({ children }: AdProviderProps) {
  const pathname = usePathname();
  const [adsLoaded, setAdsLoaded] = useState(false);

  const adsEnabled = ADS_CONFIG.enabled;
  const showAdsOnPage = shouldShowAds(pathname);
  const scriptUrl = getRaptiveScriptUrl();

  // Track when ads script is loaded
  const handleScriptLoad = () => {
    setAdsLoaded(true);
    // Raptive auto-initializes, but we can trigger refresh on route change
    if (typeof window !== 'undefined' && (window as unknown as { adthrive?: { cmd?: { push: (fn: () => void) => void } } }).adthrive?.cmd) {
      (window as unknown as { adthrive: { cmd: { push: (fn: () => void) => void } } }).adthrive.cmd.push(() => {
        // Ad refresh logic if needed
      });
    }
  };

  // Refresh ads on route change
  useEffect(() => {
    if (adsLoaded && typeof window !== 'undefined') {
      const adthrive = (window as unknown as { adthrive?: { cmd?: { push: (fn: () => void) => void } } }).adthrive;
      if (adthrive?.cmd) {
        adthrive.cmd.push(() => {
          // Raptive handles refresh automatically
        });
      }
    }
  }, [pathname, adsLoaded]);

  return (
    <AdContext.Provider value={{ adsEnabled, adsLoaded, showAdsOnPage }}>
      {adsEnabled && scriptUrl && (
        <Script
          src={scriptUrl}
          strategy="lazyOnload"
          onLoad={handleScriptLoad}
          data-no-optimize="1"
          data-cfasync="false"
        />
      )}
      {children}
    </AdContext.Provider>
  );
}
