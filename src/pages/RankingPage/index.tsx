import rocketLogo from '@/assets/rocket-logo.jpg';
import { RankingHeader } from '@/components/ranking/RankingHeader';
import { RankingEmptyState } from '@/components/ranking/RankingEmptyState';
import { CycleSummary } from '@/components/ranking/CycleSummary';
import { Podium } from '@/components/podium/Podium';
import { RankingTable } from '@/components/ranking/RankingTable';
import { RankingRules } from '@/components/ranking/RankingRules';
import { useGuildSnapshot } from '@/hooks/useGuildSnapshot';
import { useGuildRanking } from '@/hooks/useGuildRanking';
import { useImportAccess } from '@/hooks/useImportAccess';

export default function RankingPage() {
  const snapshot = useGuildSnapshot();
  const importUnlocked = useImportAccess();
  const { ranked, deadline, top } = useGuildRanking(snapshot.guildData);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <RankingHeader snapshot={snapshot} importUnlocked={importUnlocked} />
      {!snapshot.guildData ? (
        <RankingEmptyState />
      ) : (
        <>
          <CycleSummary
            guildData={snapshot.guildData}
            ranked={ranked}
            deadline={deadline}
          />
          <Podium top={top} />
          <RankingTable ranked={ranked} />
          <RankingRules />
        </>
      )}
      <footer className="section-container flex justify-between gap-5 border-t border-border pt-6 pb-[38px] text-xs text-muted-foreground [&>span:first-child]:flex [&>span:first-child]:items-center [&>span:first-child]:gap-[7px] [&>span:first-child]:text-secondary-foreground max-[620px]:flex-col">
        <span>
          <img
            src={rocketLogo}
            alt=""
            width={20}
            height={20}
            className="size-5 rounded-full object-cover"
          />{' '}
          Rocket Guild Ranking
        </span>
        <span>Transparência, participação e recompensa.</span>
      </footer>
    </main>
  );
}
