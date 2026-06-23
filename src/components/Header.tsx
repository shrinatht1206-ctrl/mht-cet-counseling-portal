import { Sun, Moon, GraduationCap } from 'lucide-react'

interface HeaderProps {
  dark: boolean
  toggle: () => void
}

export default function Header({ dark, toggle }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight">MHT-CET Counseling Portal</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Engineering Admission Prediction Dashboard</p>
          </div>
        </div>
        <button
          onClick={toggle}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>
      </div>
    </header>
  )
}
