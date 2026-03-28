'use client'
import { AnalysisResponse } from '@/lib/ttm/types'
import { Layers, TreePine, Volume2 } from 'lucide-react'

interface AnalysisPanelProps {
  result: AnalysisResponse
}

export default function AnalysisPanel({ result }: AnalysisPanelProps) {
  const { width, depth, height } = result.morpheme.dimensions

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Width Panel (X-axis) */}
      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-xl p-6 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-space-blue rounded-lg flex items-center justify-center">
            <TreePine className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-200">Width (X-axis)</h3>
            <p className="text-sm text-blue-300">Derivation & Morphology</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-blue-300 mb-1">Root:</p>
            <p className="text-lg font-mono text-blue-100 bg-blue-950/50 px-3 py-2 rounded-lg">
              {width.root}
            </p>
          </div>

          <div>
            <p className="text-sm text-blue-300 mb-1">Derivation Degree:</p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-blue-950/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (width.derivationDegree + 1) * 25)}%` }}
                />
              </div>
              <span className="text-blue-200 text-sm font-mono">{width.derivationDegree}</span>
            </div>
          </div>

          {width.possibleDerivations.length > 0 && (
            <div>
              <p className="text-sm text-blue-300 mb-2">Related Forms:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {width.possibleDerivations.slice(0, 5).map((deriv, i) => (
                  <div key={i} className="bg-blue-950/30 rounded-lg p-2 text-sm">
                    <div className="font-mono text-blue-100">{deriv.form}</div>
                    <div className="text-blue-300 text-xs">{deriv.gloss}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Depth Panel (Y-axis) */}
      <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-xl p-6 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-space-green rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-200">Depth (Y-axis)</h3>
            <p className="text-sm text-green-300">Semantic Layers</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-green-300 mb-1">Semantic Field:</p>
            <p className="text-green-100 bg-green-950/50 px-3 py-2 rounded-lg capitalize">
              {depth.semanticField || 'General'}
            </p>
          </div>

          <div>
            <p className="text-sm text-green-300 mb-2">Current Level:</p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-green-950/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(depth.currentLevel / 4) * 100}%` }}
                />
              </div>
              <span className="text-green-200 text-sm font-mono">{depth.currentLevel}/4</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-green-300 mb-2">Interpretation Layers:</p>
            <div className="space-y-2">
              {depth.layers.map((layer, i) => (
                <div 
                  key={i} 
                  className={`rounded-lg p-3 border ${
                    layer.level === depth.currentLevel 
                      ? 'bg-green-800/40 border-green-600' 
                      : 'bg-green-950/30 border-green-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-green-200 text-sm font-medium">{layer.levelName}</span>
                    <span className="text-xs text-green-400">({layer.tradition})</span>
                  </div>
                  <p className="text-green-100 text-xs">{layer.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Height Panel (Z-axis) */}
      <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-700/50 rounded-xl p-6 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-space-red rounded-lg flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-200">Height (Z-axis)</h3>
            <p className="text-sm text-red-300">Phonological Structure</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-red-300 mb-1">Base Form:</p>
            <p className="text-lg font-mono text-red-100 bg-red-950/50 px-3 py-2 rounded-lg">
              {height.baseForm}
            </p>
          </div>

          <div>
            <p className="text-sm text-red-300 mb-1">Configuration ID:</p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-red-950/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (height.configurationId / 10) * 100)}%` }}
                />
              </div>
              <span className="text-red-200 text-sm font-mono">{height.configurationId}</span>
            </div>
          </div>

          {height.vowels.length > 0 && (
            <div>
              <p className="text-sm text-red-300 mb-2">Vowels & Diacritics:</p>
              <div className="flex flex-wrap gap-1">
                {height.vowels.map((vowel, i) => (
                  <span 
                    key={i}
                    className="bg-red-950/50 border border-red-800 rounded px-2 py-1 text-red-200 font-mono text-sm"
                  >
                    {vowel}
                  </span>
                ))}
              </div>
            </div>
          )}

          {height.alternativeVocalizations.length > 0 && (
            <div>
              <p className="text-sm text-red-300 mb-2">Alternative Vocalizations:</p>
              <div className="space-y-1">
                {height.alternativeVocalizations.slice(0, 3).map((alt, i) => (
                  <div key={i} className="bg-red-950/30 rounded px-2 py-1 text-red-100 font-mono text-sm">
                    {alt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}