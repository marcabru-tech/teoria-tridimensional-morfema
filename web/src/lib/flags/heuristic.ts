// Contenção (23/10/2026): a análise de palavra isolada usa o motor heurístico
// antigo, que produz raízes inventadas e falsos positivos. Ela foi retirada do
// site público até o TTM passar a consultar as anotações dos corpora (S2.4).
//
// Só fica ativa onde TTM_ENABLE_HEURISTIC_ANALYSIS=1 (CI, desenvolvimento) e
// NUNCA em produção na Vercel, mesmo que a variável seja definida lá por engano.
export function heuristicAnalysisEnabled(): boolean {
  if (process.env.VERCEL_ENV === 'production') return false;
  return process.env.TTM_ENABLE_HEURISTIC_ANALYSIS === '1';
}

export const HEURISTIC_DISABLED_MESSAGE =
  'A análise de palavra isolada foi desativada: o motor antigo podia inventar raízes. ' +
  'A próxima versão do TTM consulta as anotações acadêmicas dos corpora, por versículo e posição.';
