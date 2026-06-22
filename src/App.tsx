import { useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { useCutoffData } from './hooks/useCutoffData'
import { StudentProfile } from './types'
import Header from './components/Header'
import ProfileManager from './components/ProfileManager'
import ProfileForm from './components/ProfileForm'
import PredictionEngine from './components/PredictionEngine'
import { GraduationCap } from 'lucide-react'

export default function App() {
  const { dark, toggle } = useTheme()
  const { records, cities, branches, loading, error } = useCutoffData()
  const [view, setView] = useState<'profiles' | 'predictions' | 'edit'>('profiles')
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null)
  const [editingProfile, setEditingProfile] = useState<StudentProfile | null>(null)

  const handleSelect = (p: StudentProfile) => {
    setSelectedProfile(p)
    setView('predictions')
  }

  const handleEdit = (p: StudentProfile) => {
    setEditingProfile(p)
    setView('edit')
  }

  const handleNew = () => {
    setEditingProfile(null)
    setView('edit')
  }

  const handleSaved = (_p: StudentProfile) => {
    setView('profiles')
    setEditingProfile(null)
  }

  const handleBack = () => {
    setView('profiles')
    setSelectedProfile(null)
    setEditingProfile(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Header dark={dark} toggle={toggle} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {view === 'profiles' && (
          <ProfileManager
            onSelect={handleSelect}
            onEdit={handleEdit}
            onNew={handleNew}
            selectedProfile={selectedProfile}
          />
        )}
        {view === 'edit' && (
          <ProfileForm
            profile={editingProfile}
            cities={cities}
            branches={branches}
            onSaved={handleSaved}
            onCancel={handleBack}
          />
        )}
        {view === 'predictions' && selectedProfile && (
          <PredictionEngine
            profile={selectedProfile}
            records={records}
            cities={cities}
            branches={branches}
            onBack={handleBack}
          />
        )}
      </main>
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl px-8 py-6 flex items-center gap-3 shadow-2xl">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading MHT-CET dataset...</span>
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl px-8 py-6 text-center shadow-2xl max-w-md">
            <GraduationCap className="w-10 h-10 mx-auto text-red-500 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Failed to load data</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
