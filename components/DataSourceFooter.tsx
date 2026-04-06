interface DataSourceFooterProps {
  generatedAt?: string;
}

export default function DataSourceFooter({ generatedAt }: DataSourceFooterProps) {
  return (
    <section className="bg-slate-50 border-t border-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-sm text-slate-600 space-y-3">
          <p>
            <strong>Data Source:</strong> Federal Highway Administration (FHWA){' '}
            <a
              href="https://www.fhwa.dot.gov/bridge/nbi/ascii2024.cfm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              National Bridge Inventory 2024
            </a>
          </p>

          <div className="space-y-2 text-slate-500">
            <p>
              Bridge inspection data is typically updated every 24 months. Conditions may have changed since the last inspection.
            </p>
            <p>
              &ldquo;Structurally deficient&rdquo; does not mean a bridge is unsafe or likely to collapse.
              It indicates that one or more key structural elements are in poor or worse condition.
              Bridges are inspected regularly and may have load restrictions in place.
            </p>
            <p>
              This data is for informational purposes only and should not be used for route clearance or vehicle weight decisions.
            </p>
          </div>

          {generatedAt && (
            <p className="text-xs text-slate-400 pt-2">
              Data processed: {new Date(generatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
