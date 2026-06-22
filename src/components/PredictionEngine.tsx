import { useState, useMemo, useCallback, Fragment } from 'react'
import { StudentProfile, CutoffRecord, PredictionRow, SEAT_TYPES } from '../types'
import { ArrowLeft, Sliders, Download, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react'
import * as XLSX from 'xlsx'
import TrendChart from './TrendChart'

interface PredictionEngineProps {
  profile: StudentProfile
  records: CutoffRecord[]
  cities: string[]
  branches: string[]
  onBack: () => void
}

export default function PredictionEngine({ profile, records, cities, branches, onBack }: PredictionEngineProps) {
  const [offset, setOffset] = useState(0)
  const [selectedSeatTypes, setSelectedSeatTypes] = useState<string[]>(profile.seat_types || [])
  const [selectedCities, setSelectedCities] = useState<string[]>(profile.preferred_cities || [])
  const [selectedBranches, setSelectedBranches] = useState<string[]>(profile.preferred_branches || [])
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const studentPercentile = useMemo(() => {
    if (selectedSeatTypes.includes('AI')) return profile.jee_percentile
    return profile.mht_cet_percentile
  }, [profile, selectedSeatTypes])

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedSeatTypes.length > 0 && !selectedSeatTypes.includes(r.Seat_Type)) return false
      if (selectedCities.length > 0 && !selectedCities.includes(r.City)) return false
      if (selectedBranches.length > 0 && !selectedBranches.includes(r.Branch)) return false
      return true
    })
  }, [records, selectedSeatTypes, selectedCities, selectedBranches])

  const grouped = useMemo(() => {
    const map = new Map<string, PredictionRow>()
    for (const r of filteredRecords) {
      const key = `${r.College_Code}|${r.Branch}|${r.Seat_Type}`
      if (!map.has(key)) {
        map.set(key, {
          collegeCode: r.College_Code,
          collegeName: r.College_Name,
          city: r.City,
          branch: r.Branch,
          seatType: r.Seat_Type,
          examType: r.Exam_Type,
          cutoff2022: null,
          cutoff2023: null,
          cutoff2024: null,
          cutoff2025: null,
          latestCutoff: null,
          avgCutoff: null,
          diff: null,
          tier: 'target',
        })
      }
      const row = map.get(key)!
      const val = r.Cutoff_Percentile
      if (r.Year === '2022') row.cutoff2022 = val
      if (r.Year === '2023') row.cutoff2023 = val
      if (r.Year === '2024') row.cutoff2024 = val
      if (r.Year === '2025') row.cutoff2025 = val
    }
    const arr = Array.from(map.values())
    for (const row of arr) {
      const vals = [row.cutoff2022, row.cutoff2023, row.cutoff2024, row.cutoff2025].filter((v) => v !== null) as number[]
      if (vals.length === 0) continue
      row.latestCutoff = vals[vals.length - 1]
      row.avgCutoff = vals.reduce((a, b) => a + b, 0) / vals.length
      const adjusted = row.avgCutoff + offset
      row.diff = studentPercentile - adjusted
      if (row.diff !== null) {
        if (row.diff < -2.0) row.tier = 'dream'
        else if (row.diff >= -2.0 && row.diff <= 2.0) row.tier = 'target'
        else row.tier = 'safe'
      }
    }
    return arr.filter((r) => r.avgCutoff !== null)
  }, [filteredRecords, studentPercentile, offset])

  const dreamRows = useMemo(() => grouped.filter((r) => r.tier === 'dream').sort((a, b) => (b.avgCutoff! - a.avgCutoff!)), [grouped])
  const targetRows = useMemo(() => grouped.filter((r) => r.tier === 'target').sort((a, b) => (b.avgCutoff! - a.avgCutoff!)), [grouped])
  const safeRows = useMemo(() => grouped.filter((r) => r.tier === 'safe').sort((a, b) => (b.avgCutoff! - a.avgCutoff!)), [grouped])

  const handleExport = useCallback(() => {
    const data: any[] = []
    const addSection = (label: string, rows: PredictionRow[]) => {
      data.push({ Tier: label, 'College Code': '', 'College Name': '', City: '', Branch: '', 'Seat Type': '', 'Avg Cutoff': '' })
      rows.forEach((r) => {
        data.push({
          Tier: label,
          'College Code': r.collegeCode,
          'College Name': r.collegeName,
          City: r.city,
          Branch: r.branch,
          'Seat Type': r.seatType,
          'Avg Cutoff': r.avgCutoff?.toFixed(4),
          'Latest Cutoff': r.latestCutoff?.toFixed(4),
          'Student Percentile': studentPercentile.toFixed(4),
          Diff: r.diff?.toFixed(4),
        })
      })
    }
    addSection('Dream', dreamRows)
    addSection('Target', targetRows)
    addSection('Safe', safeRows)
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Predictions')
    XLSX.writeFile(wb, `${profile.name}_MHT_CET_Predictions.xlsx`)
  }, [dreamRows, targetRows, safeRows, studentPercentile, profile.name])

  const toggleSeat = (s: string) => {
    setSelectedSeatTypes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }
  const toggleCity = (c: string) => {
    setSelectedCities((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }
  const toggleBranch = (b: string) => {
    setSelectedBranches((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]))
  }

  const TierBadge = ({ tier }: { tier: string }) => {
    if (tier === 'dream') return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-full text-xs font-medium"><TrendingUp className="w-3 h-3" /> Dream</span>
    if (tier === 'target') return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium"><Minus className="w-3 h-3" /> Target</span>
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium"><TrendingDown className="w-3 h-3" /> Safe</span>
  }

  const renderTable = (rows: PredictionRow[], tierLabel: string) => {
    if (rows.length === 0) return null
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold">
            {tierLabel === 'Dream' && 'Tier 1: Dream Colleges'}
            {tierLabel === 'Target' && 'Tier 2: Target Borderline Colleges'}
            {tierLabel === 'Safe' && 'Tier 3: Safe / Sure-Shot Colleges'}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">({rows.length} results)</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tier</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">College</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">City</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Branch</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Seat Type</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Avg Cutoff</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Diff</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((row) => {
                  const isOpen = expandedRow === `${row.collegeCode}-${row.branch}-${row.seatType}`
                  return (
                    <Fragment key={`${row.collegeCode}-${row.branch}-${row.seatType}`}>
                      <tr
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        onClick={() => setExpandedRow(isOpen ? null : `${row.collegeCode}-${row.branch}-${row.seatType}`)}
                      >
                        <td className="px-4 py-3"><TierBadge tier={row.tier} /></td>
                        <td className="px-4 py-3 font-medium max-w-xs truncate">{row.collegeName}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.city}</td>
                        <td className="px-4 py-3">{row.branch}</td>
                        <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">{row.seatType}</span></td>
                        <td className="px-4 py-3 text-right font-semibold">{row.avgCutoff?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={row.diff! > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {row.diff! > 0 ? '+' : ''}{row.diff?.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isOpen ? <ChevronUp className="w-4 h-4 mx-auto text-gray-400" /> : <ChevronDown className="w-4 h-4 mx-auto text-gray-400" />}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={8} className="px-4 py-4 bg-gray-50 dark:bg-gray-700/30">
                            <div className="mb-2">
                              <h4 className="text-sm font-semibold mb-1">{row.collegeName} — {row.branch}</h4>
                              <p className="text-xs text-gray-500 mb-3">Historical cutoff trajectory (Student percentile: {studentPercentile.toFixed(2)}%)</p>
                            </div>
                            <TrendChart row={row} studentPercentile={studentPercentile} />
                            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                              <div className="bg-white dark:bg-gray-800 rounded-lg px-2 py-1">
                                <p className="text-[10px] text-gray-500">2022</p>
                                <p className="text-sm font-semibold">{row.cutoff2022?.toFixed(2) ?? '-'}</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg px-2 py-1">
                                <p className="text-[10px] text-gray-500">2023</p>
                                <p className="text-sm font-semibold">{row.cutoff2023?.toFixed(2) ?? '-'}</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg px-2 py-1">
                                <p className="text-[10px] text-gray-500">2024</p>
                                <p className="text-sm font-semibold">{row.cutoff2024?.toFixed(2) ?? '-'}</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg px-2 py-1">
                                <p className="text-[10px] text-gray-500">2025</p>
                                <p className="text-sm font-semibold">{row.cutoff2025?.toFixed(2) ?? '-'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold">Prediction Results</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.name} — {studentPercentile.toFixed(2)}% {selectedSeatTypes.includes('AI') ? '(JEE)' : '(MHT-CET)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <Sliders className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Seat Types</label>
            <div className="space-y-3">
              {Object.entries(SEAT_TYPES).map(([group, types]) => (
                <div key={group}>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {types.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSeat(s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedSeatTypes.includes(s) ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Cities</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {cities.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCity(c)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCities.includes(c) ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Branches</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {branches.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggleBranch(b)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedBranches.includes(b) ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Inflation / Deflation Offset: {offset > 0 ? '+' : ''}{offset.toFixed(1)}%
            </label>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.1}
              value={offset}
              onChange={(e) => setOffset(parseFloat(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-3.0% (Easier)</span>
              <span>0.0%</span>
              <span>+3.0% (Harder)</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold mb-1">
              Competition Density Offset: {offset > 0 ? '+' : ''}{offset.toFixed(1)}%
            </label>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.1}
              value={offset}
              onChange={(e) => setOffset(parseFloat(e.target.value))}
              className="w-full accent-primary-600"
            />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-gray-500 dark:text-gray-400">Dream</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-500 dark:text-gray-400">Target</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-500 dark:text-gray-400">Safe</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {renderTable(dreamRows, 'Dream')}
        {renderTable(targetRows, 'Target')}
        {renderTable(safeRows, 'Safe')}
      </div>

      {grouped.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400">No results match the current filters. Try adjusting seat types, cities, or branches.</p>
        </div>
      )}
    </div>
  )
}
