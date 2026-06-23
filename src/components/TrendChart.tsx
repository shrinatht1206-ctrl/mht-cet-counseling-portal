import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PredictionRow } from '../types'

interface TrendChartProps {
  row: PredictionRow
  studentPercentile: number
}

export default function TrendChart({ row, studentPercentile }: TrendChartProps) {
  const data = useMemo(() => {
    const years: { year: string; cutoff: number | null }[] = [
      { year: '2022', cutoff: row.cutoff2022 },
      { year: '2023', cutoff: row.cutoff2023 },
      { year: '2024', cutoff: row.cutoff2024 },
      { year: '2025', cutoff: row.cutoff2025 },
    ].filter((d) => d.cutoff !== null)
    return years.map((d) => ({ year: d.year, cutoff: d.cutoff!, percentile: studentPercentile }))
  }, [row, studentPercentile])

  if (data.length === 0) {
    return <p className="text-sm text-gray-500">No historical data available for this branch.</p>
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Line type="monotone" dataKey="cutoff" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Cutoff" />
          <Line type="monotone" dataKey="percentile" stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} dot={false} name="Student" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
