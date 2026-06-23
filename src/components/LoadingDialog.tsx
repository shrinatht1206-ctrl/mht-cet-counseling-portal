import { useEffect, useState } from 'react';
import { Loader2, Database } from 'lucide-react';

interface Props {
  progress: number;
  total: number;
}

export function LoadingDialog({ progress, total }: Props) {
  const [visible, setVisible] = useState(true);
  const pct = Math.round((progress / total) * 100);

  useEffect(() => {
    if (progress >= total) {
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [progress, total]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mounting Admission Database
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingesting file {Math.min(progress, total)} of {total}...
            </p>
          </div>
        </div>

        <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{pct}%</span>
        </div>
      </div>
    </div>
  );
}
