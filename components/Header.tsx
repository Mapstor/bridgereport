'use client';

import Link from 'next/link';
import { useState } from 'react';

// State abbreviations for dropdown
const STATES = [
  { abbr: 'AL', name: 'Alabama' },
  { abbr: 'AK', name: 'Alaska' },
  { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' },
  { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' },
  { abbr: 'DE', name: 'Delaware' },
  { abbr: 'DC', name: 'District of Columbia' },
  { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' },
  { abbr: 'HI', name: 'Hawaii' },
  { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' },
  { abbr: 'IN', name: 'Indiana' },
  { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' },
  { abbr: 'KY', name: 'Kentucky' },
  { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' },
  { abbr: 'MD', name: 'Maryland' },
  { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' },
  { abbr: 'MN', name: 'Minnesota' },
  { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' },
  { abbr: 'MT', name: 'Montana' },
  { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' },
  { abbr: 'NH', name: 'New Hampshire' },
  { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' },
  { abbr: 'NY', name: 'New York' },
  { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' },
  { abbr: 'OH', name: 'Ohio' },
  { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' },
  { abbr: 'PA', name: 'Pennsylvania' },
  { abbr: 'PR', name: 'Puerto Rico' },
  { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' },
  { abbr: 'SD', name: 'South Dakota' },
  { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' },
  { abbr: 'UT', name: 'Utah' },
  { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' },
  { abbr: 'WA', name: 'Washington' },
  { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' },
  { abbr: 'WY', name: 'Wyoming' },
];

export default function Header() {
  const [isStatesOpen, setIsStatesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {/* Bridge icon */}
            <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-blue-600 rounded flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 18 C2 18, 6 8, 12 8 C18 8, 22 18, 22 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <line x1="2" y1="18" x2="22" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="6" y1="18" x2="6" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="18" y1="18" x2="18" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="9" y1="11" x2="9" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="12" y1="8" x2="12" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="15" y1="11" x2="15" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-slate-900">BridgeReport</span>
              <span className="text-xl font-bold text-blue-600">.org</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-slate-700 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>

            <Link
              href="/rankings"
              className="text-slate-700 hover:text-blue-600 transition-colors"
            >
              Rankings
            </Link>

            <Link
              href="/covered-bridges"
              className="text-slate-700 hover:text-blue-600 transition-colors"
            >
              Covered Bridges
            </Link>

            <Link
              href="/bridges-near-me"
              className="text-slate-700 hover:text-blue-600 transition-colors"
            >
              Near Me
            </Link>

            {/* States Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStatesOpen(!isStatesOpen)}
                onBlur={() => setTimeout(() => setIsStatesOpen(false), 150)}
                className="flex items-center text-slate-700 hover:text-blue-600 transition-colors"
              >
                States
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${isStatesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isStatesOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1 px-2">
                    {STATES.map((state) => (
                      <Link
                        key={state.abbr}
                        href={`/state/${state.abbr.toLowerCase()}`}
                        className="px-3 py-1.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                      >
                        {state.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-blue-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-slate-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/rankings"
                className="text-slate-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Rankings
              </Link>
              <Link
                href="/covered-bridges"
                className="text-slate-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Covered Bridges
              </Link>
              <Link
                href="/bridges-near-me"
                className="text-slate-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Near Me
              </Link>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-2">States</p>
                <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                  {STATES.map((state) => (
                    <Link
                      key={state.abbr}
                      href={`/state/${state.abbr.toLowerCase()}`}
                      className="text-sm text-slate-700 hover:text-blue-600 py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {state.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
