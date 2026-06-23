import { FilterState, DataRow } from '../types';
import { BRANCH_CLUSTERS } from '../utils/branches';
import { Search, X, MapPin, Building2, GitBranch, SlidersHorizontal } from 'lucide-react';

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  data: DataRow[];
  selectedClusters: string[];
  onClusterToggle: (key: string) => void;
}

export function FilterPanel({ filters, onChange, data, selectedClusters, onClusterToggle }: Props) {
  const cities = Array.from(new Set(data.map(r => r.city).filter(Boolean))).sort();
  const colleges = Array.from(new Set(
    data.filter(r => !filters.city || r.city === filters.city).map(r => r.college_name)
  )).sort();
  const branches = Array.from(new Set(
    data.filter(r => {
      if (filters.city && r.city !== filters.city) return false;
      if (filters.college && r.college_name !== filters.college) return false;
      return true;
    }).map(r => r.branch)
  )).sort();

  const update = (patch: Partial<FilterState>) => {
    const next = { ...filters, ...patch };
    if (patch.city) next.college = '';
    if (patch.city || patch.college) next.branch = '';
    onChange(next);
  };

  const reset = () => {
    onChange({ city: '', college: '', branch: '', search: '' });
  };

  const isFiltered = filters.city || filters.college || filters.branch || filters.search;

  return (
    <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        {isFiltered && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
          >
            <X className="w-4 h-4" />
            Reset All
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={e => update({ search: e.target.value })}
          placeholder="Search by college code or name..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">City</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={filters.city}
              onChange={e => update({ city: e.target.value })}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none"
            >
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">College</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={filters.college}
              onChange={e => update({ college: e.target.value })}
              disabled={!filters.city}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none disabled:opacity-50"
            >
              <option value="">All Colleges</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Branch</label>
          <div className="relative">
            <GitBranch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={filters.branch}
              onChange={e => update({ branch: e.target.value })}
              disabled={!filters.college}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none disabled:opacity-50"
            >
              <option value="">All Branches</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Quick-Select Clusters</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(BRANCH_CLUSTERS).map(([key, cluster]) => {
            const active = selectedClusters.includes(key);
            return (
              <button
                key={key}
                onClick={() => onClusterToggle(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
                  active
                    ? `${cluster.color} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ring-current`
                    : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {cluster.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
