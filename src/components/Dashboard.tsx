import { useState, useMemo } from 'react';
import { ForecastResult, FilterState, StudentProfile } from '../types';
import { TrendChartModal } from './TrendChartModal';
import { getCategoryColor } from '../utils/categories';
import { isInCluster } from '../utils/branches';
import { exportToExcel, exportToPDF } from '../utils/export';
import { TrendingUp, FileSpreadsheet, FileText, TriangleAlert as AlertTriangle, ChevronDown, ChevronUp, Sparkles, Target, ShieldCheck } from 'lucide-react';

interface Props {
  results: ForecastResult[];
  filters: FilterState;
  profile: StudentProfile;
  selectedClusters: string[];
  inflation: number;
  onInflationChange: (v: number) => void;
}

export function Dashboard({ results, filters, profile, selectedClusters, inflation, onInflationChange }: Props) {
  const [selectedRow, setSelectedRow] = useState<ForecastResult | null>(null);
  const [expandedTier, setExpandedTier] = useState<1 | 2 | 3 | null>(null);

  const filtered = useMemo(() => {
    let list = results;

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(r =>
        r.college_code.toLowerCase().includes(q) ||
        r.college_name.toLowerCase().includes(q)
      );
    } else {
      if (filters.city) list = list.filter(r => r.city === filters.city);
      if (filters.college) list = list.filter(r => r.college_name === filters.college);
      if (filters.branch) list = list.filter(r => r.branch === filters.branch);
    }

    if (selectedClusters.length > 0) {
      list = list.filter(r =>
        selectedClusters.some(k => isInCluster(r.branch, k as 'cs_tech' | 'core_circuit' | 'core_heavy'))
      );
    }

    return list;
  }, [results, filters, selectedClusters]);

  const tier1 = filtered.filter(r => r.tier === 1);
  const tier2 = filtered.filter(r => r.tier === 2);
  const tier3 = filtered.filter(r => r.tier === 3);

  const tierMeta = [
    { tier: 1 as const, label: 'Dream Status', icon: Sparkles, color: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', count: tier1.length },
    { tier: 2 as const, label: 'Realistic Target', icon: Target, color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', count: tier2.length },
    { tier: 3 as const, label: 'Sure-Shot Safe', icon: ShieldCheck, color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', count: tier3.length },
  ];

  const studentScore = profile.mhtCetPercentile;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Forecasting Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Inflation Adjust:</span>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.1}
                value={inflation}
                onChange={e => onInflationChange(parseFloat(e.target.value))}
                className="w-24 accent-blue-600"
              />
              <span className="font-medium w-12 text-right">{inflation > 0 ? '+' : ''}{inflation.toFixed(1)}%</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportToExcel(filtered)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition border border-emerald-200 dark:border-emerald-800"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() => exportToPDF(filtered, profile)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition border border-red-200 dark:border-red-800"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {tierMeta.map(meta => (
            <button
              key={meta.tier}
              onClick={() => setExpandedTier(expandedTier === meta.tier ? null : meta.tier)}
              className={`flex items-center justify-between p-4 rounded-xl border transition text-left ${meta.color}`}
            >
              <div className="flex items-center gap-3">
                <meta.icon className={`w-5 h-5 ${meta.text}`} />
                <div>
                  <p className={`font-semibold text-sm ${meta.text}`}>{meta.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{meta.count} options</p>
                </div>
              </div>
              {expandedTier === meta.tier ? (
                <ChevronUp className={`w-4 h-4 ${meta.text}`} />
              ) : (
                <ChevronDown className={`w-4 h-4 ${meta.text}`} />
              )}
            </button>
          ))}
        </div>

        {expandedTier && (
          <TierTable
            tier={expandedTier}
            results={expandedTier === 1 ? tier1 : expandedTier === 2 ? tier2 : tier3}
            studentScore={studentScore}
            onRowClick={setSelectedRow}
          />
        )}
      </div>

      <TrendChartModal result={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  );
}

function TierTable({
  tier,
  results,
  studentScore,
  onRowClick,
}: {
  tier: 1 | 2 | 3;
  results: ForecastResult[];
  studentScore: number;
  onRowClick: (r: ForecastResult) => void;
}) {
  const bgClass =
    tier === 1
      ? 'bg-rose-50/50 dark:bg-rose-950/10'
      : tier === 2
      ? 'bg-amber-50/50 dark:bg-amber-950/10'
      : 'bg-emerald-50/50 dark:bg-emerald-950/10';

  const rowBgClass =
    tier === 1
      ? 'hover:bg-rose-100/60 dark:hover:bg-rose-900/20'
      : tier === 2
      ? 'hover:bg-amber-100/60 dark:hover:bg-amber-900/20'
      : 'hover:bg-emerald-100/60 dark:hover:bg-emerald-900/20';

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 ${bgClass}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Choice Code</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">College</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">City</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Branch</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Seat Type</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Forecast</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Gap</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {results.map(r => {
              const gap = r.forecast - studentScore;
              const gapStr = gap > 0 ? `+${gap.toFixed(2)}` : gap.toFixed(2);
              return (
                <tr
                  key={r.choice_code + r.seat_type}
                  onClick={() => onRowClick(r)}
                  className={`cursor-pointer transition ${rowBgClass}`}
                >
                  <td className="px-4 py-3 font-mono text-gray-900 dark:text-white">{r.choice_code}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{r.college_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.city}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.branch}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(r.seat_type)}`}>
                      {r.seat_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{r.forecast}%</td>
                  <td className={`px-4 py-3 text-right font-medium ${gap > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {gapStr}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.isVolatile && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <AlertTriangle className="w-3 h-3" />
                        Volatile
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {results.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No results match current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
