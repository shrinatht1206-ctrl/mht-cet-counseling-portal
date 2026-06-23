export interface DataRow {
  year: number;
  college_code: string;
  college_name: string;
  city: string;
  branch: string;
  seat_type: string;
  cutoff_percentile: number;
  choice_code: string;
}

export interface StudentProfile {
  name: string;
  mhtCetPercentile: number;
  jeePercentile: number;
  homeUniversity: string;
  category: CategoryKey;
}

export type CategoryKey =
  | 'Open'
  | 'OBC'
  | 'EWS'
  | 'TFWS'
  | 'SC'
  | 'ST'
  | 'NT_VJ'
  | 'SEBC'
  | 'DEFENSE'
  | 'PWD'
  | 'AI_MINORITY'
  | 'All';

export interface ForecastResult {
  choice_code: string;
  college_code: string;
  college_name: string;
  city: string;
  branch: string;
  seat_type: string;
  forecast: number;
  volatility: number;
  isVolatile: boolean;
  trendPenalty: number;
  historical: Record<number, number>;
  years: number[];
  tier: 1 | 2 | 3;
}

export interface FilterState {
  city: string;
  college: string;
  branch: string;
  search: string;
}
