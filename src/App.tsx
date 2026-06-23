import { useState, useEffect, useCallback } from 'react';
import { DataRow, StudentProfile, FilterState, ForecastResult } from './types';
import { useTheme } from './hooks/useTheme';
import { ingestData } from './utils/ingestion';
import { buildForecast } from './utils/forecasting';
import { LoadingDialog } from './components/LoadingDialog';
import { ProfileBuilder } from './components/ProfileBuilder';
import { FilterPanel } from './components/FilterPanel';
import { Dashboard } from './components/Dashboard';
import { Sun, Moon, GraduationCap } from 'lucide-react';

function App() {
  const { dark, toggle } = useTheme();
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    mhtCetPercentile: 0,
    jeePercentile: 0,
    homeUniversity: '',
    category: 'Open',
  });

  const [filters, setFilters] = useState<FilterState>({
    city: '',
    college: '',
    branch: '',
    search: '',
  });

  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [inflation, setInflation] = useState(0);

  const [results, setResults] = useState<ForecastResult[]>([]);

  useEffect(() => {
    let mounted = true;
    ingestData((current) => {
      if (mounted) setProgress(current);
    })
      .then(rows => {
        if (!mounted) return;
        setData(rows);
        setLoading(false);
        setProgress(10);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    const forecast = buildForecast(data, profile, profile.category, inflation);
    setResults(forecast);
  }, [data, profile, inflation]);

  const handleClusterToggle = useCallback((key: string) => {
    setSelectedClusters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors">
      {loading && <LoadingDialog progress={progress} total={10} />}

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  MHT-CET 2026
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admission Forecasting & Counseling</p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {dark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-300">
            <p className="font-medium">Failed to load data</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!error && data.length === 0 && !loading && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 text-amber-700 dark:text-amber-300">
            No data loaded. Please check that the data files exist in the /public directory.
          </div>
        )}

        {data.length > 0 && (
          <>
            <ProfileBuilder profile={profile} onChange={setProfile} />

            <FilterPanel
              filters={filters}
              onChange={setFilters}
              data={data}
              selectedClusters={selectedClusters}
              onClusterToggle={handleClusterToggle}
            />

            <Dashboard
              results={results}
              filters={filters}
              profile={profile}
              selectedClusters={selectedClusters}
              inflation={inflation}
              onInflationChange={setInflation}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
