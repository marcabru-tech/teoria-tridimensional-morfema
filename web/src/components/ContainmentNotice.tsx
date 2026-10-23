import { BookOpen } from 'lucide-react'

// Aviso público enquanto a análise antiga está desativada (ver src/lib/flags/heuristic.ts).
export default function ContainmentNotice() {
  return (
    <section data-testid="containment-notice" className="max-w-3xl mx-auto py-12 space-y-6 text-slate-300">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-100">O TTM Explorer está sendo reconstruído</h2>
      <p>
        A análise de palavras digitadas isoladamente foi retirada do site. O motor que a fazia tentava
        deduzir a raiz a partir das letras e, nos nossos testes, chegou a apontar raízes que a palavra
        não tem.
      </p>
      <p>
        A próxima versão será um explorador de corpora delimitados: a Bíblia Hebraica e o Alcorão.
        Você vai navegar pelo texto, escolher uma palavra num versículo e ver a análise que
        especialistas já registraram para aquela posição, com a fonte citada. Onde as fontes divergem,
        as posições aparecem lado a lado.
      </p>
    </section>
  )
}
