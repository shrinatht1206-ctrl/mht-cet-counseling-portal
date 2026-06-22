import { useEffect, useState, useMemo } from 'react'
import { CutoffRecord } from '../types'
import { ingestAllData } from '../services/DataIngestionService'

export function useCutoffData() {
  const [records, setRecords] = useState<CutoffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await ingestAllData()
        setRecords([...rows])
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
    for (const r of records) if (r.city) s.add(r.city)
    return Array.from(s).sort()
  }, [records])

  const branches = useMemo(() => {
    const s = new Set<string>()
    for (const r of records) if (r.branch_name) s.add(r.branch_name)
    return Array.from(s).sort()
  }, [records])

  return { records, cities, branches, loading, error }
}
