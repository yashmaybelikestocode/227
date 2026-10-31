import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-5 w-full', lines = 1 }) => {
  return (
    <div className="space-y-2 animate-pulse" role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`bg-mint-soft rounded ${className}`} />
      ))}
    </div>
  );
};
