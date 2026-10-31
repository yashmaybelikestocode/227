import React, { useSyncExternalStore } from 'react';
import { getDataSource, subscribeDataSource } from '../api';

/** Shows whether the last data call used the backend ("Live data") or sample data. */
export const DataSourceChip: React.FC = () => {
  const source = useSyncExternalStore(subscribeDataSource, getDataSource, getDataSource);
  if (!source) return null;

  const live = source === 'live';
  const label = live ? 'Live data' : 'Sample data';

  return (
    <span
      role="status"
      aria-label={live ? 'Data source: live data from the Cypher backend' : 'Data source: sample data'}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-line text-muted text-xs font-medium rounded-full"
      data-testid="data-source-chip"
    >
      <span
        aria-hidden="true"
        className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-accent' : 'bg-amber border border-amber-text/40'}`}
      />
      {label}
    </span>
  );
};
