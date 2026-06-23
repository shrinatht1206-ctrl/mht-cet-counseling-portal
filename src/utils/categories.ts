import { CategoryKey } from '../types';

export const CATEGORY_MAP: Record<CategoryKey, string[]> = {
  Open: ['GOPENS', 'LOPENS', 'GOPENH', 'GOPENO', 'LOPENH', 'LOPENO'],
  OBC: ['GOBCS', 'LOBCS'],
  EWS: ['EWS'],
  TFWS: ['TFWS'],
  SC: ['GSCS', 'LSCS'],
  ST: ['GSTS', 'LSTS'],
  NT_VJ: ['GNT1S', 'LNT1S', 'GNT2S', 'LNT2S', 'GNT3S', 'LNT3S', 'GVJS', 'LVJS'],
  SEBC: ['GSEBCS', 'LSEBCS'],
  DEFENSE: ['DEFOPENS', 'DEFOBCS', 'DEFSCS', 'DEFSTS'],
  PWD: ['PWDOPENS', 'PWDOBCS', 'PWDSCS', 'PWDSTS'],
  AI_MINORITY: ['AI', 'MI', 'ORPHAN'],
  All: [],
};

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  Open: 'Open / General',
  OBC: 'OBC',
  EWS: 'EWS',
  TFWS: 'TFWS (Tuition Fee Waiver)',
  SC: 'SC',
  ST: 'ST',
  NT_VJ: 'NT / VJ (Nomadic Tribes)',
  SEBC: 'SEBC',
  DEFENSE: 'Defense Quotas',
  PWD: 'PWD Quotas',
  AI_MINORITY: 'All India / Minority',
  All: 'All Categories',
};

export function getSeatTypesForCategory(cat: CategoryKey): string[] {
  if (cat === 'All') return [];
  return CATEGORY_MAP[cat];
}

export function getCategoryColor(seatType: string): string {
  if (seatType === 'AI' || seatType === 'MI') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (seatType.startsWith('GO')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
  if (seatType.startsWith('LO')) return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
  if (seatType.includes('OBC')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  if (seatType.includes('SC')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  if (seatType.includes('ST')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
  if (seatType.includes('NT') || seatType.includes('VJ')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
  if (seatType.includes('EWS')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
  if (seatType.includes('TFWS')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
  if (seatType.includes('DEF')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  if (seatType.includes('PWD')) return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}
