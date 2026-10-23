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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/hubstry-logo-white-800.png"
              alt="Hubstry"
              width={160}
              height={20}
              className="hidden sm:block h-5 w-auto opacity-90"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>Desenvolvido por</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/hubstry-logo-white-800.png"
              alt="Hubstry"
              width={128}
              height={16}
              className="h-4 w-auto"
            />
          </div>
          {/* Selo oficial do NVIDIA Inception Program, usado sem alterações */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/nvidia-inception-program-badge.svg"
            alt="Membro do NVIDIA Inception Program"
            width={160}
            height={69}
            className="h-auto w-40"
          />
        </div>
      </footer>
    </div>
  )
}
