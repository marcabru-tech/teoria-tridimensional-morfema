'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import SearchForm from '@/components/SearchForm'
import AnalysisPanel from '@/components/AnalysisPanel'
import { AnalysisResponse } from '@/lib/ttm/types'
import { Atom, AlertCircle } from 'lucide-react'

// Dynamically import the 3D visualizer to avoid SSR issues
const MorphemeVisualizer = dynamic(
  () => import('@/components/MorphemeVisualizer'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-slate-900/50 rounded-xl border border-slate-700 flex items-center justify-center">
        <div className="text-slate-400">Loading 3D visualizer...</div>
      </div>
    )
  }
)

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (text: string, language: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysisResult(data)
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">TTM Explorer</h1>
              <p className="text-slate-400">Teoria Tridimensional do Morfema</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Form */}
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-red-200 font-medium">Analysis Error</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {analysisResult && (
          <div className="space-y-8">
            {/* 3D Visualization */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Atom className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-semibold text-slate-100">3D Morpheme Space</h2>
              </div>
              <MorphemeVisualizer result={analysisResult} />
            </div>

            {/* Analysis Panels */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 via-green-600 to-red-600 rounded" />
                <h2 className="text-2xl font-semibold text-slate-100">Dimensional Analysis</h2>
              </div>
              <AnalysisPanel result={analysisResult} />
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {!analysisResult && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Atom className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">
              Welcome to TTM Explorer
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-6">
              Explore morphemes in three-dimensional space using the Teoria Tridimensional do Morfema. 
              Analyze words across Width (derivation), Depth (semantics), and Height (phonology) dimensions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <h3 className="text-blue-300 font-medium mb-2">Width (X-axis)</h3>
                <p className="text-blue-200 text-sm">Morphological derivation and root analysis</p>
              </div>
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <h3 className="text-green-300 font-medium mb-2">Depth (Y-axis)</h3>
                <p className="text-green-200 text-sm">Semantic layers and interpretive levels</p>
              </div>
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                <h3 className="text-red-300 font-medium mb-2">Height (Z-axis)</h3>
                <p className="text-red-200 text-sm">Phonological structure and vocalization</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}