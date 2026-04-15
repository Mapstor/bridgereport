import Link from 'next/link';

export default function BridgeNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Bridge Not Found</h1>
        <p className="text-slate-600 mb-6">
          This bridge is not in our database. BridgeReport focuses on highway bridges 50 feet
          and longer from the National Bridge Inventory — smaller structures like culverts and
          minor crossings are not included in our records.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Search for a Bridge
          </Link>
          <p className="text-sm text-slate-500">
            or <Link href="/" className="text-blue-600 hover:underline">browse all bridges</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
