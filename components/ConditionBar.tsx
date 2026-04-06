'use client';

interface ConditionBarProps {
  good: number;
  fair: number;
  poor: number;
  total: number;
  height?: number;
  showLabels?: boolean;
}

export default function ConditionBar({ good, fair, poor, total, height = 28, showLabels = true }: ConditionBarProps) {
  const gw = (good / total) * 100;
  const fw = (fair / total) * 100;
  const pw = (poor / total) * 100;

  return (
    <div className="flex rounded overflow-hidden w-full" style={{ height }}>
      <div
        className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
        style={{ width: `${gw}%` }}
      >
        {showLabels && gw > 12 && good.toLocaleString()}
      </div>
      <div
        className="bg-yellow-500 flex items-center justify-center text-white text-xs font-bold"
        style={{ width: `${fw}%` }}
      >
        {showLabels && fw > 12 && fair.toLocaleString()}
      </div>
      <div
        className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
        style={{ width: `${pw}%`, minWidth: pw > 0 ? '24px' : '0' }}
      >
        {showLabels && pw > 3 && poor}
      </div>
    </div>
  );
}
