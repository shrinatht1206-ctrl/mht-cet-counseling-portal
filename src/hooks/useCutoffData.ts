import { useEffect, useState, useMemo } from 'react'
import Papa from 'papaparse'
import { CutoffRecord } from '../types'

export function useCutoffData() {
  const [records, setRecords] = useState<CutoffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/MHT_CET_Cutoff_2022_2025_AI_Unified.csv')
        if (!res.ok) throw new Error('Failed to fetch CSV')
        const csv = await res.text()
        const result = Papa.parse(csv, { header: true, skipEmptyLines: true, dynamicTyping: true })
        const rows = (result.data as any[]).map((r) => ({
          Year: String(r.Year || ''),
          College_Code: String(r.College_Code || ''),
          College_Name: String(r.College_Name || ''),
          City: String(r.City || ''),
          Branch: String(r.Branch || ''),
          Seat_Type: String(r.Seat_Type || ''),
          Cutoff_Percentile: parseFloat(r.Cutoff_Percentile) || 0,
          CAP_Round: String(r.CAP_Round || ''),
          Exam_Type: String(r.Exam_Type || ''),
          Choice_Code: String(r.Choice_Code || ''),
          Merit_No: String(r.Merit_No || ''),
        })) as CutoffRecord[]
        setRecords(rows)
        setLoading(false)
      } catch (e) {
        setError((e as Error).message)
        setLoading(false)
      }
    }
    load()
  }, [])

  const cities = useMemo(() => {
    const s = new Set<string>()
    for (const r of records) if (r.City) s.add(r.City.trim())
    return Array.from(s).sort()
  }, [records])

  const branches = useMemo(() => {
    const s = new Set<string>()
    for (const r of records) if (r.Branch) s.add(r.Branch.trim())
    return Array.from(s).sort()
  }, [records])

  return { records, cities, branches, loading, error }
}
