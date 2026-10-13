import { dateLabel } from '@/utils/formatters';
import type { GuildData, RankedMember } from '@/types/guild';

interface CycleSummaryProps {
  guildData: GuildData;
  ranked: RankedMember[];
  deadline: Date;
}

export function CycleSummary({
  guildData,
  ranked,
  deadline,
}: CycleSummaryProps) {
  return (
    <section className="mt-3.5 grid grid-cols-[.7fr_.6fr_1.5fr_1.5fr] overflow-hidden rounded-[20px] border border-border bg-secondary backdrop-blur-[14px] [&>div]:flex [&>div]:flex-col [&>div]:gap-[5px] [&>div]:border-r [&>div]:border-border [&>div]:px-5 [&>div]:py-[18px] [&>div:last-child]:border-r-0 [&_.muted]:text-xs [&_.muted]:uppercase [&_.muted]:tracking-[.09em] [&_strong]:text-[15px] max-[900px]:grid-cols-2 max-[900px]:[&>div:nth-child(2)]:border-r-0 max-[900px]:[&>div:nth-child(-n+2)]:border-b max-[620px]:grid-cols-1 max-[620px]:[&>div]:border-r-0 max-[620px]:[&>div]:border-b max-[620px]:[&>div:last-child]:border-b-0 section-container">
      <div>
        <span className="muted">Guild</span>
        <strong>{guildData.guild || 'Rocket'}</strong>
      </div>
      <div>
        <span className="muted">Jogadores</span>
        <strong>{ranked.length}</strong>
      </div>
      <div>
        <span className="muted">Entrega da premiação</span>
        <strong>{dateLabel(deadline)} • 21h</strong>
      </div>
      <div>
        <span className="muted">Presença obrigatória</span>
        <strong>Boss de segunda • 21h</strong>
      </div>
    </section>
  );
}
