import { Atom } from 'lucide-react'

// Cabeçalho e rodapé do site, comuns ao aviso público e à interface antiga.
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Identidade provisória: a logo do Polyograph entra quando for enviada. */}
          <p className="text-sm text-slate-400">
            Parte do <span className="text-slate-200 font-medium">Polyograph</span> — deep polymath and polyglot
            ecosystem
          </p>
          <p className="text-sm text-slate-500">Projeto de pesquisa, não comercial.</p>
        </div>
      </footer>
    </div>
  )
}
