import SiteShell from '@/components/SiteShell'
import LegacyExplorer from '@/components/LegacyExplorer'
import ContainmentNotice from '@/components/ContainmentNotice'
import { heuristicAnalysisEnabled } from '@/lib/flags/heuristic'

// Lido a cada requisição: o mesmo build serve o modo público e o de CI.
export const dynamic = 'force-dynamic'

export default function Home() {
  return <SiteShell>{heuristicAnalysisEnabled() ? <LegacyExplorer /> : <ContainmentNotice />}</SiteShell>
}
