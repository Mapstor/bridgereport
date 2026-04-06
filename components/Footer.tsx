import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-white">BridgeReport</span>
              <span className="text-xl font-bold text-blue-400">.org</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Comprehensive bridge condition data for America&apos;s 623,218 highway bridges.
              Explore bridge infrastructure by state, county, or location.
            </p>
            <p className="text-xs text-slate-500">
              Data sourced from the Federal Highway Administration (FHWA) National Bridge Inventory (NBI).
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/rankings" className="text-sm hover:text-blue-400 transition-colors">
                  Bridge Rankings
                </Link>
              </li>
              <li>
                <Link href="/bridges-near-me" className="text-sm hover:text-blue-400 transition-colors">
                  Bridges Near Me
                </Link>
              </li>
              <li>
                <Link href="/longest-bridges" className="text-sm hover:text-blue-400 transition-colors">
                  Longest Bridges
                </Link>
              </li>
              <li>
                <Link href="/oldest-bridges" className="text-sm hover:text-blue-400 transition-colors">
                  Oldest Bridges
                </Link>
              </li>
              <li>
                <Link href="/historic-bridges" className="text-sm hover:text-blue-400 transition-colors">
                  Historic Bridges
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="text-sm hover:text-blue-400 transition-colors">
                  Methodology
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://www.fhwa.dot.gov/bridge/nbi.cfm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-400 transition-colors flex items-center"
                >
                  Data Source (FHWA)
                  <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              &copy; {currentYear} BridgeReport.org. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-600">|</span>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">
                Terms of Use
              </Link>
            </div>
            <p className="text-xs text-slate-500 text-center md:text-right">
              Bridge inspection data is typically updated every 24 months. Conditions may have changed.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
