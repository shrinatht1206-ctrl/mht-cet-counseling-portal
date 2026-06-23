import { useMemo } from 'react';
import { ForecastResult } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { X, TrendingUp } from 'lucide-react';

interface Props {
  result: ForecastResult | null;
  onClose: () => void;
}

export function TrendChartModal({ result, onClose }: Props) {
  const chartData = useMemo(() => {
    if (!result) return [];
    const years = Object.keys(result.historical).map(Number).sort();
    return years.map(y => ({
      year: String(y),
      cutoff: result.historical[y],
    }));
  }, [result]);

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Historical Trend
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <span className="text-gray-500 dark:text-gray-400">College</span>
              <p className="font-medium text-gray-900 dark:text-white mt-0.5">{result.college_name}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <span className="text-gray-500 dark:text-gray-400">Branch</span>
              <p className="font-medium text-gray-900 dark:text-white mt-0.5">{result.branch}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <span className="text-gray-500 dark:text-gray-400">Seat Type</span>
              <p className="font-medium text-gray-900 dark:text-white mt-0.5">{result.seat_type}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <span className="text-gray-500 dark:text-gray-400">2026 Forecast</span>
              <p className="font-medium text-gray-900 dark:text-white mt-0.5">{result.forecast}%</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cutoff"
                  name="Cutoff Percentile"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
