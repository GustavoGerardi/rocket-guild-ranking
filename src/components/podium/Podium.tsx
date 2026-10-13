import { PodiumCard } from './PodiumCard';
import { RULES } from '@/utils/ranking';
import type { RankedMember } from '@/types/guild';

interface PodiumProps {
  top: RankedMember[];
}

export function Podium({ top }: PodiumProps) {
  return (
    <section className="pt-[76px] pb-9 max-[620px]:pt-[54px] section-container">
      <div className="section-heading text-center">
        <p className="eyebrow">DESTAQUES DA SEMANA</p>
        <h2>Top 3 Rockets</h2>
        <p>Os três melhores Rocket do momento.</p>
      </div>
      <div className="mt-9 grid grid-cols-[1fr_1.16fr_1fr] items-end gap-[18px] max-[900px]:grid-cols-1">
        <PodiumCard member={top[1]} place={2} prize={RULES.prizes[1]} />
        <PodiumCard member={top[0]} place={1} prize={RULES.prizes[0]} />
        <PodiumCard member={top[2]} place={3} prize={RULES.prizes[2]} />
      </div>
    </section>
  );
}
