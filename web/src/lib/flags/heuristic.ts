// Contenção (23/10/2026): a análise de palavra isolada usa o motor heurístico
// antigo, que produz raízes inventadas e falsos positivos. Ela foi retirada do
// site público até o TTM passar a consultar as anotações dos corpora (S2.4).
//
// Política: ativação permitida SÓ no CI e no desenvolvimento local.
// Duas camadas, para não depender de uma única variável:
//  1. qualquer sinal de deploy na Vercel (VERCEL ou VERCEL_ENV definidos,
//     seja production, preview ou development) bloqueia;
//  2. fora disso, só ativa com TTM_ENABLE_HEURISTIC_ANALYSIS=1 E num contexto
//     de CI (CI=true) ou de desenvolvimento (NODE_ENV=development). Assim, se
//     a Vercel não expuser as variáveis de sistema, um deploy com a flag
//     ainda fica bloqueado, porque lá CI não está definido em tempo de
//     execução e NODE_ENV é production.
// Este módulo não importa nada, para ser testado direto pelo Node.

type Env = Record<string, string | undefined>;

export function heuristicAnalysisEnabled(env: Env = process.env): boolean {
  if (env.VERCEL || env.VERCEL_ENV) return false;
  if (env.TTM_ENABLE_HEURISTIC_ANALYSIS !== '1') return false;
  return env.CI === 'true' || env.NODE_ENV === 'development';
}

export const HEURISTIC_DISABLED_MESSAGE =
  'A análise de palavra isolada foi desativada: o motor antigo podia inventar raízes. ' +
  'A próxima versão do TTM consulta as anotações acadêmicas dos corpora, por versículo e posição.';
