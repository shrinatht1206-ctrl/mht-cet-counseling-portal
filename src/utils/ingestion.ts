import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataRow } from '../types';
import { normalizeCity } from './normalization';

const EXCEL_FILES = [
  '/CET_PART_1.xlsx',
  '/CET_PART_2.xlsx',
  '/CET_PART_3.xlsx',
  '/CET_PART_4.xlsx',
  '/CET_PART_5.xlsx',
  '/CET_PART_6.xlsx',
  '/CET_PART_7.xlsx',
  '/CET_PART_8.xlsx',
  '/CET_PART_9.xlsx',
];

const CSV_FILE = '/MHT_CET_Cutoff_2022_2025_AI_Unified.csv';

function castRow(row: Record<string, unknown>): DataRow | null {
  const year = parseInt(String(row.year || row.Year || ''), 10);
  const collegeCode = String(row.college_code || row.College_Code || row['college code'] || row['College Code'] || '');
  const collegeName = String(row.college_name || row.College_Name || row['college name'] || row['College Name'] || '');
  const city = String(row.city || row.City || '');
  const branch = String(row.branch || row.Branch || '');
  const seatType = String(row.seat_type || row.Seat_Type || row['seat type'] || row['Seat Type'] || '');
  const cutoffRaw = row.cutoff_percentile || row.Cutoff_Percentile || row['cutoff percentile'] || row['Cutoff Percentile'];
  const cutoff = parseFloat(String(cutoffRaw ?? ''));

  if (!collegeCode || !collegeName || !branch || !seatType) return null;

  const normalizedCity = normalizeCity(city);
  const choiceCode = `${collegeCode}${branch}`;

  return {
    year: isNaN(year) ? 0 : year,
    college_code: collegeCode,
    college_name: collegeName,
    city: normalizedCity,
    branch: branch,
    seat_type: seatType,
    cutoff_percentile: isNaN(cutoff) ? 0 : cutoff,
    choice_code: choiceCode,
  };
}

function parseExcel(buf: ArrayBuffer): DataRow[] {
  const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
  if (json.length < 2) return [];
  const headers = (json[0] as string[]).map(h => String(h).toLowerCase().trim());
  const rows: DataRow[] = [];
  for (let i = 1; i < json.length; i++) {
    const raw = json[i] as (string | number | undefined)[];
    const obj: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = raw[j];
    }
    const row = castRow(obj);
    if (row) rows.push(row);
  }
  return rows;
}

export async function ingestData(
  onProgress: (current: number, total: number) => void
): Promise<DataRow[]> {
  const allRows: DataRow[] = [];
  let completed = 0;
  const total = 10;

  const promises: Promise<void>[] = [];

  for (let i = 0; i < EXCEL_FILES.length; i++) {
    const file = EXCEL_FILES[i];
    promises.push(
      fetch(file)
        .then(r => {
          if (!r.ok) throw new Error(`Failed to fetch ${file}: ${r.status}`);
          return r.arrayBuffer();
        })
        .then(buf => {
          const rows = parseExcel(buf);
          allRows.push(...rows);
          completed++;
          onProgress(completed, total);
        })
        .catch(err => {
          console.error(`Error loading ${file}:`, err);
          completed++;
          onProgress(completed, total);
        })
    );
  }

  promises.push(
    fetch(CSV_FILE)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to fetch ${CSV_FILE}: ${r.status}`);
        return r.text();
      })
      .then(text => {
        return new Promise<void>((resolve) => {
          Papa.parse(text, {
            header: true,
            worker: false,
            skipEmptyLines: true,
            complete: (results) => {
              for (const row of results.data as Record<string, unknown>[]) {
                const casted = castRow(row);
                if (casted) allRows.push(casted);
              }
              completed++;
              onProgress(completed, total);
              resolve();
            },
            error: () => {
              completed++;
              onProgress(completed, total);
              resolve();
            },
          });
        });
      })
      .catch(err => {
        console.error(`Error loading ${CSV_FILE}:`, err);
        completed++;
        onProgress(completed, total);
      })
  );

  await Promise.all(promises);
  return allRows;
}
