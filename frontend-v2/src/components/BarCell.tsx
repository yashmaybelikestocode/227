import React from 'react';

interface BarCellProps {
  value: number;
  max: number;
}

export const BarCell: React.FC<BarCellProps> = ({ value, max }) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-right font-mono text-sm text-ink">{value}</span>
      <div className="flex-1 max-w-[90px] h-2.5 bg-mint rounded-pill overflow-hidden">
        <div
          className="h-full bg-accent rounded-pill transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
