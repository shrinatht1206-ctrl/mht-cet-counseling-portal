import { useState, useEffect, useCallback } from 'react'
import { StudentProfile } from '../types'
import { fetchProfiles, deleteProfile } from '../lib/supabase'
import { Plus, Trash2, Edit3, User, ChevronRight } from 'lucide-react'

interface ProfileManagerProps {
  onSelect: (p: StudentProfile) => void
  onEdit: (p: StudentProfile) => void
  onNew: () => void
  selectedProfile: StudentProfile | null
}

export default function ProfileManager({ onSelect, onEdit, onNew, selectedProfile }: ProfileManagerProps) {
  const [profiles, setProfiles] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProfiles()
      setProfiles(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student profile?')) return
    setDeleting(id)
    try {
      await deleteProfile(id)
      setProfiles((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Student Profiles</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and evaluate student profiles for college predictions</p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Profile
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
          <User className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-medium mb-1">No profiles yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first student profile to start evaluating college predictions.</p>
          <button
            onClick={onNew}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            Create Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => {
            const isSelected = selectedProfile?.id === p.id
            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border transition-all p-5 ${
                  isSelected
                    ? 'border-primary-500 ring-1 ring-primary-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">{p.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.home_university || 'No university'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">MHT-CET</p>
                    <p className="text-sm font-semibold">{p.mht_cet_percentile}%</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">JEE</p>
                    <p className="text-sm font-semibold">{p.jee_percentile}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                    {p.category || 'No category'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                    {p.seat_types?.length || 0} seat types
                  </span>
                </div>
                <button
                  onClick={() => onSelect(p)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Evaluate Predictions
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
