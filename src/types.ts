export interface CutoffRecord {
  Year: string;
  College_Code: string;
  College_Name: string;
  City: string;
  Branch: string;
  Seat_Type: string;
  Cutoff_Percentile: number;
  CAP_Round: string;
  Exam_Type: string;
  Choice_Code: string;
  Merit_No: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  mht_cet_percentile: number;
  jee_percentile: number;
  home_university: string;
  category: string;
  preferred_cities: string[];
  preferred_branches: string[];
  seat_types: string[];
  created_at: string;
}

export interface PredictionRow {
  collegeCode: string;
  collegeName: string;
  city: string;
  branch: string;
  seatType: string;
  examType: string;
  cutoff2022: number | null;
  cutoff2023: number | null;
  cutoff2024: number | null;
  cutoff2025: number | null;
  latestCutoff: number | null;
  avgCutoff: number | null;
  diff: number | null;
  tier: 'dream' | 'target' | 'safe';
}

export const SEAT_TYPES = {
  'General State': ['GOPENS', 'LOPENS', 'GOBCS', 'LOBCS', 'GSCS', 'LSCS', 'GSTS', 'LSTS'],
  'NT/VJ State': ['GNT1S', 'LNT1S', 'GNT2S', 'LNT2S', 'GNT3S', 'LNT3S', 'GVJS', 'LVJS'],
  'Socio-Economic / Quotas': ['EWS', 'TFWS', 'GSEBCS', 'LSEBCS', 'ORPHAN'],
  'Defense Quota': ['DEFOPENS', 'DEFOBCS', 'DEFSCS', 'DEFSTS', 'DEFROBCS', 'DEFRSCS', 'DEFRSTS'],
  'PWD Quota': ['PWDOPENS', 'PWDOBCS', 'PWDSCS', 'PWDSTS'],
  'Regional Codes': ['GOPENH', 'GOPENO', 'LOPENH', 'LOPENO'],
  'All India / Minority': ['AI', 'MI'],
} as const;

export const ALL_SEAT_TYPES = Object.values(SEAT_TYPES).flat();

export const HOME_UNIVERSITIES = [
  'SPPU', 'MU', 'BATU', 'SGBAU', 'RTMNU', 'BAMU', 'SNDT', 'Other'
];
