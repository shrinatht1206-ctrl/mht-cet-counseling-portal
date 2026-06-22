import { useState, useMemo, useCallback, Fragment } from 'react'
import { StudentProfile, CutoffRecord, PredictionRow, BRANCH_CLUSTERS } from '../types'
import { ArrowLeft, Sliders, Download, FileText, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, X, RotateCcw, Cpu, Zap, Activity } from 'lucide-react'
import * as XLSX from 'xlsx'
import TrendChart from './TrendChart'
import { generateParentSummaryPDF } from '../services/PdfExportService'

interface PredictionEngineProps {
  profile: StudentProfile
  records: CutoffRecord[]
  cities: string[]
  branches: string[]
  onBack: () => void
}

export default function PredictionEngine({ profile, records, cities, branches: _branches, onBack }: PredictionEngineProps) {
  const [offset, setOffset] = useState(0)
  const [selectedSeatTypes, setSelectedSeatTypes] = useState<string[]>(profile.seat_types || [])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedCollege, setSelectedCollege] = useState<string>('')
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [selectedBranches, setSelectedBranches] = useState<string[]>(profile.preferred_branches || [])
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [modalRow, setModalRow] = useState<PredictionRow | null>(null)

  const studentPercentile = useMemo(() => {
    if (selectedSeatTypes.includes('AI')) return profile.jee_percentile
    return profile.mht_cet_percentile
  }, [profile, selectedSeatTypes])

  const cityFilteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedSeatTypes.length > 0 && !selectedSeatTypes.includes(r.seat_type)) return false
      if (selectedCity && r.city !== selectedCity) return false
      if (selectedCollege && r.college_name !== selectedCollege) return false
      if (selectedBranches.length > 0 && !selectedBranches.includes(r.branch_name)) return false
      return true
    })
  }, [records, selectedSeatTypes, selectedCity, selectedCollege, selectedBranches])

  const availableColleges = useMemo(() => {
    const s = new Set<string>()
    for (const r of records) {
      if (selectedSeatTypes.length > 0 && !selectedSeatTypes.includes(r.seat_type)) continue
      if (selectedCity && r.city !== selectedCity) continue
      s.add(r.college_name)
    }
    return Array.from(s).sort()
  }, [records, selectedSeatTypes, selectedCity])

  const availableBranches = useMemo(() => {
    const s = new Set<string>()
    for (const r of records) {
      if (selectedSeatTypes.length > 0 && !selectedSeatTypes.includes(r.seat_type)) continue
      if (selectedCity && r.city !== selectedCity) continue
      if (selectedCollege && r.college_name !== selectedCollege) continue
      s.add(r.branch_name)
    }
    return Array.from(s).sort()
  }, [records, selectedSeatTypes, selectedCity, selectedCollege])

  const grouped = useMemo(() => {
    const map = new Map<string, PredictionRow>()
    for (const r of cityFilteredRecords) {
      const key = `${r.college_code}|${r.branch_name}|${r.seat_type}`
      if (!map.has(key)) {
        map.set(key, {
          college_code: r.college_code,
          college_name: r.college_name,
          city: r.city,
          branch_name: r.branch_name,
          seat_type: r.seat_type,
          exam_type: r.exam_type || '',
          cutoff2022: null,
          cutoff2023: null,
          cutoff2024: null,
          cutoff2025: null,
          latestCutoff: null,
          avgCutoff: null,
          diff: null,
          tier: 'target',
          volatility: 0,
          highVolatility: false,
          choice_code: r.choice_code,
        })
      }
      const row = map.get(key)!
      const val = r.cutoff_percentile
      if (r.year === 2022) row.cutoff2022 = val
      if (r.year === 2023) row.cutoff2023 = val
      if (r.year === 2024) row.cutoff2024 = val
      if (r.year === 2025) row.cutoff2025 = val
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
        if (row.diff < 0) row.tier = 'dream'
        else if (row.diff <= 2.0) row.tier = 'target'
        else row.tier = 'safe'
      }
      if (vals.length >= 2) {
        const min = Math.min(...vals)
        const max = Math.max(...vals)
        row.volatility = max - min
        row.highVolatility = row.volatility > 1.0
      }
    }
    return arr.filter((r) => r.avgCutoff !== null)
  }, [cityFilteredRecords, studentPercentile, offset])

  const dreamRows = useMemo(() => grouped.filter((r) => r.tier === 'dream').sort((a, b) => (b.avgCutoff! - a.avgCutoff!)).slice(0, 15), [grouped])
  const targetRows = useMemo(() => grouped.filter((r) => r.tier === 'target').sort((a, b) => (b.avgCutoff! - a.avgCutoff!)).slice(0, 35), [grouped])
  const safeRows = useMemo(() => grouped.filter((r) => r.tier === 'safe').sort((a, b) => (b.avgCutoff! - a.avgCutoff!)).slice(0, 20), [grouped])

  const handleExport = useCallback(() => {
    const data: any[] = []
    const addSection = (label: string, rows: PredictionRow[]) => {
      data.push({ Tier: label, 'College Code': '', 'College Name': '', City: '', Branch: '', 'Seat Type': '', 'Avg Cutoff': '' })
      rows.forEach((r) => {
        data.push({
          Tier: label,
          'College Code': r.college_code,
          'College Name': r.college_name,
          City: r.city,
          Branch: r.branch_name,
          'Seat Type': r.seat_type,
          'Avg Cutoff': r.avgCutoff?.toFixed(4),
          'Latest Cutoff': r.latestCutoff?.toFixed(4),
          'Student Percentile': studentPercentile.toFixed(4),
          Diff: r.diff?.toFixed(4),
          Volatility: r.highVolatility ? 'High' : 'Stable',
          'Choice Code': r.choice_code || '',
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

  const handlePDF = async () => {
    setExporting(true)
    try {
      await generateParentSummaryPDF(profile, dreamRows, targetRows, safeRows)
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  const toggleSeat = (s: string) => {
    setSelectedSeatTypes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const resetFilters = () => {
    setSelectedCity('')
    setSelectedCollege('')
    setSelectedBranch('')
    setSelectedBranches([])
    setSelectedSeatTypes(profile.seat_types || [])
    setOffset(0)
  }

  const applyCluster = (clusterName: string) => {
    const clusterBranches = BRANCH_CLUSTERS[clusterName] || []
    setSelectedBranches((prev) => {
      const next = new Set(prev)
      for (const b of clusterBranches) {
        if (availableBranches.includes(b)) next.add(b)
      }
      return Array.from(next)
    })
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Seat</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Avg</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Diff</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((row) => {
                  const key = `${row.college_code}-${row.branch_name}-${row.seat_type}`
                  const isOpen = expandedRow === key
                  return (
                    <Fragment key={key}>
                      <tr
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        onClick={() => setExpandedRow(isOpen ? null : key)}
                      >
                        <td className="px-4 py-3"><TierBadge tier={row.tier} /></td>
                        <td className="px-4 py-3 font-medium max-w-xs truncate">{row.college_name}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.city}</td>
                        <td className="px-4 py-3">{row.branch_name}</td>
                        <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">{row.seat_type}</span></td>
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
                              <h4 className="text-sm font-semibold mb-1">{row.college_name} — {row.branch_name}</h4>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs text-gray-500">Historical cutoff trajectory (Student percentile: {studentPercentile.toFixed(2)}%)</p>
                                {row.highVolatility && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-medium">
                                    <Activity className="w-3 h-3" /> High YoY Volatility
                                  </span>
                                )}
                              </div>
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
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setModalRow(row) }}
                                className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700"
                              >
                                View Full Analytics
                              </button>
                              {row.choice_code && (
                                <span className="text-[10px] text-gray-500">Choice Code: {row.choice_code}</span>
                              )}
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
    <div className="space-y-6" id="prediction-root">
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
          <button
            onClick={handlePDF}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">City</label>
              <select
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setSelectedCollege(''); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Cities</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">College Name</label>
              <select
                value={selectedCollege}
                onChange={(e) => { setSelectedCollege(e.target.value); setSelectedBranch(''); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Colleges</option>
                {availableColleges.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Branch Name</label>
              <select
                value={selectedBranch}
                onChange={(e) => { setSelectedBranch(e.target.value); setSelectedBranches(e.target.value ? [e.target.value] : []) }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Branches</option>
                {availableBranches.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Seat Type</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {['AI', 'GOPENS', 'LOPENS', 'GOBCS', 'LOBCS', 'GSCS', 'LSCS', 'EWS', 'TFWS', 'MI'].map((s) => (
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
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Branch Super-Clusters</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(BRANCH_CLUSTERS).map((cluster) => (
                <button
                  key={cluster}
                  onClick={() => applyCluster(cluster)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  {cluster === 'CS / IT / Tech' ? <Cpu className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                  {cluster}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">
                Inflation / Deflation Offset: {offset > 0 ? '+' : ''}{offset.toFixed(1)}%
              </label>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.1}
                value={offset}
                onChange={(e) => setOffset(parseFloat(e.target.value))}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-1.0% (Easier)</span>
                <span>0.0%</span>
                <span>+1.0% (Harder)</span>
              </div>
            </div>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
          {selectedBranches.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedBranches.map((b) => (
                <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                  {b}
                  <button onClick={() => setSelectedBranches((prev) => prev.filter((x) => x !== b))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          )}
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
              min={-1}
              max={1}
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

      {modalRow && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{modalRow.college_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{modalRow.branch_name} — {modalRow.seat_type}</p>
              </div>
              <button onClick={() => setModalRow(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <TrendChart row={modalRow} studentPercentile={studentPercentile} />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center mb-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2 py-2">
                <p className="text-[10px] text-gray-500">2022</p>
                <p className="text-sm font-semibold">{modalRow.cutoff2022?.toFixed(2) ?? '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2 py-2">
                <p className="text-[10px] text-gray-500">2023</p>
                <p className="text-sm font-semibold">{modalRow.cutoff2023?.toFixed(2) ?? '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2 py-2">
                <p className="text-[10px] text-gray-500">2024</p>
                <p className="text-sm font-semibold">{modalRow.cutoff2024?.toFixed(2) ?? '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2 py-2">
                <p className="text-[10px] text-gray-500">2025</p>
                <p className="text-sm font-semibold">{modalRow.cutoff2025?.toFixed(2) ?? '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                <Activity className="w-3 h-3" /> YoY Volatility: {modalRow.volatility.toFixed(2)}%
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                Avg Cutoff: {modalRow.avgCutoff?.toFixed(2)}%
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                Diff: {modalRow.diff?.toFixed(2)}%
              </span>
              {modalRow.choice_code && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                  Choice Code: {modalRow.choice_code}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
