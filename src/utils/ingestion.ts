import { DataRow } from '../types';
import { supabase } from '../lib/supabase';

export async function ingestData(
  onProgress: (current: number, total: number) => void
): Promise<DataRow[]> {
  onProgress(1, 3);

  const { data: collegesData, error: collegesError } = await supabase
    .from('colleges')
    .select('college_code, college_name, city');

  if (collegesError) {
    console.error('Error fetching colleges:', collegesError);
    throw new Error(collegesError.message);
  }

  const collegesMap = new Map<string, { college_name: string; city: string }>();
  for (const c of collegesData || []) {
    collegesMap.set(c.college_code, { college_name: c.college_name, city: c.city });
  }

  onProgress(2, 3);

  const { data: records, error: recordsError } = await supabase
    .from('cutoff_records')
    .select('year, college_code, branch, seat_type, cutoff_percentile');

  if (recordsError) {
    console.error('Error fetching cutoff_records:', recordsError);
    throw new Error(recordsError.message);
  }

  onProgress(3, 3);

  const rows: DataRow[] = [];
  for (const r of records || []) {
    const college = collegesMap.get(r.college_code);
    if (!college) continue;

    rows.push({
      year: r.year,
      college_code: r.college_code,
      college_name: college.college_name,
      city: college.city,
      branch: r.branch,
      seat_type: r.seat_type,
      cutoff_percentile: parseFloat(String(r.cutoff_percentile)),
      choice_code: `${r.college_code}${r.branch}`,
    });
  }

  return rows;
}
