import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { listHotspots } from '../api';
import { Hotspot } from '../types';
import { BarCell } from '../components/BarCell';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

type SortColumn = 'file' | 'decided_against' | 'undone_later' | 'adjusted_later' | 'still_open' | 'last_discussed';

export const HotspotsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  const [sortCol, setSortCol] = useState<SortColumn>('decided_against');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const fetchHotspots = () => {
    setLoading(true);
    setError(false);
    listHotspots()
      .then((data) => {
        setHotspots(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHotspots();
  }, []);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(false);
    }
  };

  // Calculate maximum for each numeric column
  const columnMaxes = useMemo(() => {
    return {
      decided_against: Math.max(...hotspots.map((h) => h.decided_against), 1),
      undone_later: Math.max(...hotspots.map((h) => h.undone_later), 1),
      adjusted_later: Math.max(...hotspots.map((h) => h.adjusted_later), 1),
      still_open: Math.max(...hotspots.map((h) => h.still_open), 1),
    };
  }, [hotspots]);

  const sortedHotspots = useMemo(() => {
    return [...hotspots].sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'file') {
        cmp = a.file.localeCompare(b.file);
      } else if (sortCol === 'last_discussed') {
        cmp = new Date(a.last_discussed).getTime() - new Date(b.last_discussed).getTime();
      } else {
        cmp = a[sortCol] - b[sortCol];
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [hotspots, sortCol, sortAsc]);

  const renderSortArrow = (col: SortColumn) => {
    if (sortCol !== col) return null;
    return <span className="ml-1 text-xs">{sortAsc ? '▲' : '▼'}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight">
          Hot spots
        </h1>
        <p className="text-muted text-[15px] mt-1">
          Files where the team argued, postponed or changed its mind the most.
        </p>
      </div>

      {loading && <Skeleton className="h-64 w-full" />}
      {error && <ErrorState onRetry={fetchHotspots} />}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="bg-surface rounded-card border border-line overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-mint text-ink font-semibold border-b border-line text-xs uppercase tracking-wider">
                    <th
                      scope="col"
                      onClick={() => handleSort('file')}
                      className="py-3 px-4 cursor-pointer hover:bg-mint-deep/30 transition-colors select-none"
                    >
                      File {renderSortArrow('file')}
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('decided_against')}
                      className="py-3 px-4 cursor-pointer hover:bg-mint-deep/30 transition-colors select-none"
                    >
                      Decided against {renderSortArrow('decided_against')}
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('undone_later')}
                      className="py-3 px-4 cursor-pointer hover:bg-mint-deep/30 transition-colors select-none"
                    >
                      Undone later {renderSortArrow('undone_later')}
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('adjusted_later')}
                      className="py-3 px-4 cursor-pointer hover:bg-mint-deep/30 transition-colors select-none"
                    >
                      Adjusted later {renderSortArrow('adjusted_later')}
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('still_open')}
                      className="py-3 px-4 cursor-pointer hover:bg-mint-deep/30 transition-colors select-none"
                    >
                      Still open {renderSortArrow('still_open')}
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('last_discussed')}
                      className="py-3 px-4 cursor-pointer hover:bg-mint-deep/30 transition-colors select-none"
                    >
                      Last discussed {renderSortArrow('last_discussed')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {sortedHotspots.map((row) => (
                    <tr
                      key={row.file}
                      onClick={() => navigate(`/code/${row.file}`)}
                      className="hover:bg-mint-soft/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-ink">
                        {row.file}
                      </td>
                      <td className="py-3.5 px-4">
                        <BarCell value={row.decided_against} max={columnMaxes.decided_against} />
                      </td>
                      <td className="py-3.5 px-4">
                        <BarCell value={row.undone_later} max={columnMaxes.undone_later} />
                      </td>
                      <td className="py-3.5 px-4">
                        <BarCell value={row.adjusted_later} max={columnMaxes.adjusted_later} />
                      </td>
                      <td className="py-3.5 px-4">
                        <BarCell value={row.still_open} max={columnMaxes.still_open} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted whitespace-nowrap">
                        {row.last_discussed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3.5 bg-mint-soft/50 border border-line rounded-card text-xs text-muted leading-relaxed">
            A high count does not mean the code is bad. It usually means the team thought hard about it.
          </div>
        </div>
      )}
    </div>
  );
};
