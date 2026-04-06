import type { RankingBridge } from '@/types';

interface HistoricBridgesMaterialChartProps {
  bridges: RankingBridge[];
}

// Get color for material
function getMaterialColor(material: string): string {
  if (material.includes('Wood')) return '#854d0e'; // yellow-800 (wood brown)
  if (material.includes('Masonry')) return '#7c3aed'; // violet-600 (stone purple)
  if (material.includes('Steel')) return '#2563eb'; // blue-600
  if (material.includes('Iron')) return '#dc2626'; // red-600
  if (material.includes('Concrete')) return '#059669'; // emerald-600
  return '#64748b'; // slate-500
}

export default function HistoricBridgesMaterialChart({ bridges }: HistoricBridgesMaterialChartProps) {
  // Count by material
  const materialCounts: Record<string, number> = {};
  bridges.forEach(bridge => {
    const material = bridge.materialName || 'Unknown';
    // Simplify material names
    let simpleMaterial = material;
    if (material.includes('Wood')) simpleMaterial = 'Wood/Timber';
    else if (material.includes('Masonry')) simpleMaterial = 'Masonry';
    else if (material.includes('Iron')) simpleMaterial = 'Iron';
    else if (material.includes('Steel') && !material.includes('Continuous')) simpleMaterial = 'Steel';
    else if (material.includes('Steel Continuous')) simpleMaterial = 'Steel';
    else if (material.includes('Concrete')) simpleMaterial = 'Concrete';

    materialCounts[simpleMaterial] = (materialCounts[simpleMaterial] || 0) + 1;
  });

  // Sort by count
  const sortedMaterials = Object.entries(materialCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCount = sortedMaterials[0]?.[1] || 1;

  return (
    <div className="space-y-4">
      {sortedMaterials.map(([material, count]) => {
        const widthPercent = (count / maxCount) * 100;
        const color = getMaterialColor(material);

        return (
          <div key={material}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">{material}</span>
              <span className="text-sm font-semibold text-slate-900">{count} bridges</span>
            </div>
            <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: color,
                  minWidth: '60px',
                }}
              >
                <span className="text-xs font-medium text-white/90">
                  {((count / bridges.length) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
