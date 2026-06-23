import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { CutoffRecord } from '../types'

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
]

const CSV_FILE = '/MHT_CET_Cutoff_2022_2025_AI_Unified.csv'

function sanitizeRow(raw: any): CutoffRecord | null {
  const year = Number(raw.year ?? raw.Year)
  const college_code = String(raw.college_code ?? raw.College_Code ?? '').trim()
  const college_name = String(raw.college_name ?? raw.College_Name ?? '').trim()
  const city = String(raw.city ?? raw.City ?? '').trim()
  const branch_name = String(raw.branch_name ?? raw.Branch ?? '').trim()
  const seat_type = String(raw.seat_type ?? raw.Seat_Type ?? '').trim()
  const cutoff_percentile = parseFloat(raw.cutoff_percentile ?? raw.Cutoff_Percentile ?? 0)
  if (!college_code || !college_name || !branch_name || !seat_type || Number.isNaN(cutoff_percentile)) return null
  return {
    year: Number.isNaN(year) ? 0 : year,
    college_code,
    college_name,
    city,
    branch_name,
    seat_type,
    cutoff_percentile,
    cap_round: String(raw.cap_round ?? raw.CAP_Round ?? '').trim() || undefined,
    exam_type: String(raw.exam_type ?? raw.Exam_Type ?? '').trim() || undefined,
    choice_code: String(raw.choice_code ?? raw.Choice_Code ?? '').trim() || undefined,
    merit_no: String(raw.merit_no ?? raw.Merit_No ?? '').trim() || undefined,
  }
}

function parseExcel(url: string): Promise<CutoffRecord[]> {
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch ${url}`)
      return res.arrayBuffer()
    })
    .then((buf) => {
      const wb = XLSX.read(buf, { type: 'array', cellDates: false })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as any[]
      return rows.map(sanitizeRow).filter((r): r is CutoffRecord => r !== null)
    })
}

function parseCSV(url: string): Promise<CutoffRecord[]> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}`)
        return res.text()
      })
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            const rows = (results.data as any[]).map(sanitizeRow).filter((r): r is CutoffRecord => r !== null)
            resolve(rows)
          },
          error: (err: any) => reject(err),
        })
      })
      .catch(reject)
  })
}

let masterCache: Readonly<CutoffRecord[]> | null = null

export async function ingestAllData(): Promise<Readonly<CutoffRecord[]>> {
  if (masterCache) return masterCache
  const promises: Promise<CutoffRecord[]>[] = [
    ...EXCEL_FILES.map((f) => parseExcel(f)),
    parseCSV(CSV_FILE),
  ]
  const allSets = await Promise.all(promises)
  const flat = allSets.flat()
  Object.freeze(flat)
  masterCache = flat
  return flat
}

export function getMasterData(): Readonly<CutoffRecord[]> | null {
  return masterCache
}

export function clearMasterData(): void {
  masterCache = null
}
