import { StudentProfile, CategoryKey } from '../types';
import { CATEGORY_LABELS } from '../utils/categories';
import { User, GraduationCap, Chrome as Home, Percent, ChevronDown } from 'lucide-react';

interface Props {
  profile: StudentProfile;
  onChange: (profile: StudentProfile) => void;
}

const CATEGORIES: CategoryKey[] = [
  'Open', 'OBC', 'EWS', 'TFWS', 'SC', 'ST', 'NT_VJ', 'SEBC', 'DEFENSE', 'PWD', 'AI_MINORITY'
];

const UNIVERSITIES = ['SPPU', 'MU', 'BATU', 'SGBAU', 'RTMNU', 'DBATU', 'SUK', 'OTHER'];

export function ProfileBuilder({ profile, onChange }: Props) {
  const update = <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) => {
    onChange({ ...profile, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Student Profile</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={profile.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Enter name"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">MHT-CET Percentile</label>
          <div className="relative">
            <Percent className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={profile.mhtCetPercentile || ''}
              onChange={e => update('mhtCetPercentile', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">JEE Main Percentile</label>
          <div className="relative">
            <Percent className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={profile.jeePercentile || ''}
              onChange={e => update('jeePercentile', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Home University</label>
          <div className="relative">
            <Home className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={profile.homeUniversity}
              onChange={e => update('homeUniversity', e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none"
            >
              <option value="">Select University</option>
              {UNIVERSITIES.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reservation Category</label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={profile.category}
              onChange={e => update('category', e.target.value as CategoryKey)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
