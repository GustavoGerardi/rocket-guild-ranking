import rocketLogo from '@/assets/rocket-logo.jpg';
import { GuildImportPanel } from '@/components/admin/GuildImportPanel';
import type { GuildSnapshot } from '@/hooks/useGuildSnapshot';

interface RankingHeaderProps {
  snapshot: GuildSnapshot;
  importUnlocked: boolean;
}

export function RankingHeader({
  snapshot,
  importUnlocked,
}: RankingHeaderProps) {
  return (
    <header className="pt-14 pb-[30px] max-[620px]:pt-8 section-container">
      <div className="flex items-start gap-[18px] max-[620px]:gap-3">
        <img
          src={rocketLogo}
          alt="Logo Rocket"
          width={56}
          height={56}
          className="size-14 shrink-0 rounded-full border border-border object-cover max-[620px]:size-[46px]"
        />
        <div>
          <p className="eyebrow">GUILD ROCKET • RANKING SEMANAL</p>
          <h1 className="max-w-[860px] text-[clamp(2.25rem,6vw,4.5rem)] leading-[.98] font-bold tracking-[-.055em] max-[620px]:text-[2.5rem] [&_span]:text-primary-hover">
            Performance que vira <span>recompensa.</span>
          </h1>
        </div>
      </div>
      <p className="mt-5 ml-[74px] max-w-[700px] text-[17px] leading-[1.65] text-secondary-foreground max-[900px]:ml-0 max-[620px]:text-[15px]">
        Importe o JSON da guild e veja o ranking calculado automaticamente com
        dailies, contribuição e bônus de equilíbrio.
      </p>

      <GuildImportPanel {...snapshot} importUnlocked={importUnlocked} />
    </header>
  );
}
