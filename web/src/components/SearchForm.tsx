'use client'
import { useState } from 'react'
import { Search, Globe } from 'lucide-react'

interface SearchFormProps {
  onSearch: (text: string, language: string) => void
  isLoading: boolean
}

const LANGUAGES = [
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'he', name: 'עברית', rtl: true },
  { code: 'pt', name: 'Português', rtl: false },
  { code: 'en', name: 'English', rtl: false },
]

const DEMO_MORPHEMES = {
  ar: ['كتب', 'قرأ', 'درس', 'علم'],
  he: ['מלך', 'שמר', 'כתב', 'למד'],
  pt: ['escrever', 'ler', 'estudar'],
  en: ['write', 'read', 'study'],
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('ar')
  
  const selectedLang = LANGUAGES.find(l => l.code === language)
  const demos = DEMO_MORPHEMES[language as keyof typeof DEMO_MORPHEMES] || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSearch(text.trim(), language)
    }
  }

  const handleDemoClick = (morpheme: string) => {
    setText(morpheme)
    onSearch(morpheme, language)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900/50 rounded-xl backdrop-blur border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-slate-100">Morpheme Analysis</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-2 min-w-fit">
            <Globe className="w-5 h-5 text-slate-400" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* Text Input */}
          <div className="flex-1">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Enter morpheme in ${selectedLang?.name}...`}
              className={`w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectedLang?.rtl ? 'rtl' : ''}`}
              dir={selectedLang?.rtl ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-fit"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Analyze
          </button>
        </div>
      </form>

      {/* Demo Morphemes */}
      {demos.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-slate-400 mb-3">Quick examples:</p>
          <div className="flex flex-wrap gap-2">
            {demos.map(morpheme => (
              <button
                key={morpheme}
                onClick={() => handleDemoClick(morpheme)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-md text-sm transition-colors border border-slate-600 hover:border-slate-500"
                style={{ direction: selectedLang?.rtl ? 'rtl' : 'ltr' }}
              >
                {morpheme}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}