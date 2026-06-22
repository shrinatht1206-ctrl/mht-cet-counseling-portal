import { useState, useMemo } from 'react'
import { StudentProfile, ALL_SEAT_TYPES, HOME_UNIVERSITIES } from '../types'
import { createProfile, updateProfile } from '../lib/supabase'
import { ArrowLeft, Save, Check, ChevronDown } from 'lucide-react'

interface ProfileFormProps {
  profile: StudentProfile | null
  cities: string[]
  branches: string[]
  onSaved: (p: StudentProfile) => void
  onCancel: () => void
}

export default function ProfileForm({ profile, cities, branches, onSaved, onCancel }: ProfileFormProps) {
  const [name, setName] = useState(profile?.name || '')
  const [mht, setMht] = useState(profile?.mht_cet_percentile?.toString() || '')
  const [jee, setJee] = useState(profile?.jee_percentile?.toString() || '')
  const [homeUni, setHomeUni] = useState(profile?.home_university || '')
  const [category, setCategory] = useState(profile?.category || '')
  const [selectedCities, setSelectedCities] = useState<string[]>(profile?.preferred_cities || [])
  const [selectedBranches, setSelectedBranches] = useState<string[]>(profile?.preferred_branches || [])
  const [selectedSeats, setSelectedSeats] = useState<string[]>(profile?.seat_types || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openCity, setOpenCity] = useState(false)
  const [openBranch, setOpenBranch] = useState(false)
  const [openSeat, setOpenSeat] = useState(false)
  const [searchCity, setSearchCity] = useState('')
  const [searchBranch, setSearchBranch] = useState('')
  const [searchSeat, setSearchSeat] = useState('')

  const cityFiltered = useMemo(() => {
    return cities.filter(c => c.toLowerCase().includes(searchCity.toLowerCase()))
  }, [cities, searchCity])

  const branchFiltered = useMemo(() => {
    return branches.filter(b => b.toLowerCase().includes(searchBranch.toLowerCase()))
  }, [branches, searchBranch])

  const seatFiltered = useMemo(() => {
    return ALL_SEAT_TYPES.filter(s => s.toLowerCase().includes(searchSeat.toLowerCase()))
  }, [searchSeat])

  const toggleCity = (c: string) => {
    setSelectedCities(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }
  const toggleBranch = (b: string) => {
    setSelectedBranches(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  }
  const toggleSeat = (s: string) => {
    setSelectedSeats(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const mhtVal = parseFloat(mht)
    const jeeVal = parseFloat(jee)
    if (!name.trim()) return setError('Name is required')
    if (isNaN(mhtVal) || mhtVal < 0 || mhtVal > 100) return setError('MHT-CET percentile must be 0-100')
    if (isNaN(jeeVal) || jeeVal < 0 || jeeVal > 100) return setError('JEE percentile must be 0-100')
    if (selectedSeats.length === 0) return setError('Select at least one seat type')
    setSaving(true)
    try {
      const payload: Omit<StudentProfile, 'id' | 'created_at'> = {
        name: name.trim(),
        mht_cet_percentile: mhtVal,
        jee_percentile: jeeVal,
        home_university: homeUni,
        category: category,
        preferred_cities: selectedCities,
        preferred_branches: selectedBranches,
        seat_types: selectedSeats,
      }
      const result = profile ? await updateProfile(profile.id, payload) : await createProfile(payload)
      onSaved(result)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">{profile ? 'Edit Profile' : 'New Student Profile'}</h2>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Student Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Home University</label>
            <select
              value={homeUni}
              onChange={e => setHomeUni(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select university</option>
              {HOME_UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">MHT-CET Percentile</label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={mht}
              onChange={e => setMht(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00 - 100.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">JEE Main Percentile</label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={jee}
              onChange={e => setJee(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00 - 100.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., OPEN, OBC, SC, ST"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Seat Types</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenSeat(!openSeat)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <span className={selectedSeats.length ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
                {selectedSeats.length ? `${selectedSeats.length} selected` : 'Select seat types'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSeat ? 'rotate-180' : ''}`} />
            </button>
            {openSeat && (
              <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <input
                    value={searchSeat}
                    onChange={e => setSearchSeat(e.target.value)}
                    placeholder="Search seat types..."
                    className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs"
                  />
                </div>
                {seatFiltered.map(s => (
                  <div
                    key={s}
                    onClick={() => toggleSeat(s)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedSeats.includes(s) ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-500'}`}>
                      {selectedSeats.includes(s) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSeats.map(s => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                  {s}
                  <button onClick={() => toggleSeat(s)} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Cities</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenCity(!openCity)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <span className={selectedCities.length ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
                  {selectedCities.length ? `${selectedCities.length} selected` : 'Select cities'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openCity ? 'rotate-180' : ''}`} />
              </button>
              {openCity && (
                <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                  <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <input
                      value={searchCity}
                      onChange={e => setSearchCity(e.target.value)}
                      placeholder="Search cities..."
                      className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs"
                    />
                  </div>
                  {cityFiltered.map(c => (
                    <div
                      key={c}
                      onClick={() => toggleCity(c)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedCities.includes(c) ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-500'}`}>
                        {selectedCities.includes(c) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedCities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCities.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs">
                    {c}
                    <button onClick={() => toggleCity(c)} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preferred Branches</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenBranch(!openBranch)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <span className={selectedBranches.length ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
                  {selectedBranches.length ? `${selectedBranches.length} selected` : 'Select branches'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openBranch ? 'rotate-180' : ''}`} />
              </button>
              {openBranch && (
                <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                  <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <input
                      value={searchBranch}
                      onChange={e => setSearchBranch(e.target.value)}
                      placeholder="Search branches..."
                      className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs"
                    />
                  </div>
                  {branchFiltered.map(b => (
                    <div
                      key={b}
                      onClick={() => toggleBranch(b)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedBranches.includes(b) ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-500'}`}>
                        {selectedBranches.includes(b) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedBranches.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedBranches.map(b => (
                  <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-xs">
                    {b}
                    <button onClick={() => toggleBranch(b)} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {profile ? 'Save Changes' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
