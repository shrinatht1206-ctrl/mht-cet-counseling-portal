export interface CutoffRecord {
  year: number;
  college_code: string;
  college_name: string;
  city: string;
  branch_name: string;
  seat_type: string;
  cutoff_percentile: number;
  cap_round?: string;
  exam_type?: string;
  choice_code?: string;
  merit_no?: string;
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
  college_code: string;
  college_name: string;
  city: string;
  branch_name: string;
  seat_type: string;
  exam_type: string;
  cutoff2022: number | null;
  cutoff2023: number | null;
  cutoff2024: number | null;
  cutoff2025: number | null;
  latestCutoff: number | null;
  avgCutoff: number | null;
  diff: number | null;
  tier: 'dream' | 'target' | 'safe';
  volatility: number;
  highVolatility: boolean;
  choice_code?: string;
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

export const BRANCH_CLUSTERS: Record<string, string[]> = {
  'CS / IT / Tech': [
    'Computer Engineering',
    'Computer Science and Engineering',
    'CSE',
    'Information Technology',
    'IT',
    'Artificial Intelligence and Data Science',
    'AI & Data Science',
    'Artificial Intelligence and Machine Learning',
    'AIML',
    'Data Science',
    'Cyber Security',
  ],
  'Core Circuit': [
    'Electronics and Telecommunication Engineering',
    'Electronics & Telecommunication',
    'EnTC',
    'Electronics Engineering',
    'Electronics',
    'Electrical Engineering',
    'Electrical',
  ],
};

export const BRANCH_CLUSTER_MAP = new Map<string, string>();
for (const [cluster, branches] of Object.entries(BRANCH_CLUSTERS)) {
  for (const b of branches) {
    BRANCH_CLUSTER_MAP.set(b, cluster);
  }
}
