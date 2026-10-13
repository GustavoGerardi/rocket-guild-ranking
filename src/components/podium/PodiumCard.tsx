import { Award, Crown, Gift, Medal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from 'cn';
import { formatNumber } from '@/utils/formatters';
import type { RankedMember } from '@/types/guild';

interface PodiumCardProps {
  member: RankedMember | undefined;
  place: 1 | 2 | 3;
  prize: number;
}

export function PodiumCard({ member, place, prize }: PodiumCardProps) {
  const variants = {
    1: {
      className:
        'text-gold border-gold/60 shadow-lg shadow-black/25 min-h-[352px] -translate-y-3.5 p-7 max-[900px]:order-first max-[900px]:translate-y-0 max-[900px]:min-h-[320px]',
      icon: Crown,
      label: '1º lugar',
    },
    2: {
      className: 'text-silver border-silver/50',
      icon: Medal,
      label: '2º lugar',
    },
    3: {
      className: 'text-bronze border-bronze/50',
      icon: Award,
      label: '3º lugar',
    },
  };
  const variant = variants[place];
  const Icon = variant.icon;

  if (!member) return null;

  return (
    <Card
      className={cn(
        'relative block min-h-[300px] overflow-hidden rounded-3xl border bg-card p-6 shadow-[0_20px_65px_rgba(0,0,0,.28)] [&>*]:relative [&>*]:z-1 max-[620px]:min-h-0',
        variant.className,
      )}
    >
      <div className="pointer-events-none absolute! z-0! -top-[90px] -right-20 size-[220px] rounded-full bg-current opacity-[.08] blur-[35px]" />
      <div className="flex items-center gap-[9px] text-[13px] font-semibold uppercase tracking-[.09em]">
        <Icon size={place === 1 ? 34 : 28} strokeWidth={1.8} />
        <span>{variant.label}</span>
      </div>
      <h3
        className={cn(
          'mt-6 mb-3.5 text-[clamp(1.35rem,2vw,1.8rem)] font-bold tracking-[-.02em] text-foreground',
          place === 1 && 'text-[clamp(1.8rem,3vw,2.5rem)]',
        )}
      >
        {member.name}
      </h3>
      <div className="inline-flex flex-col gap-px [&>small]:text-[11px] [&>small]:font-bold [&>small]:uppercase [&>small]:tracking-[.12em] [&>small]:text-muted-foreground">
        <span
          className={cn(
            'text-[38px] font-bold tracking-[-.05em]',
            place === 1 && 'text-[52px]',
          )}
        >
          {formatNumber(member.totalPoints)}
        </span>
        <small>Rocket Points</small>
      </div>
      <div className="mt-[22px] grid grid-cols-3 gap-2 [&>div]:flex [&>div]:flex-col [&>div]:rounded-xl [&>div]:bg-secondary [&>div]:p-2.5 [&>div]:text-foreground [&_strong]:text-[15px] [&_span]:mt-[3px] [&_span]:text-[10px] [&_span]:text-muted-foreground max-[620px]:grid-cols-[repeat(3,minmax(0,1fr))] max-[620px]:[&>div]:p-2">
        <div>
          <strong>{member.dailiesCompleted}</strong>
          <span>Dailies</span>
        </div>
        <div>
          <strong>{formatNumber(member.contribution, 0)}</strong>
          <span>Contribuição</span>
        </div>
        <div>
          <strong>+{formatNumber(member.bonusPoints)}</strong>
          <span>Bônus</span>
        </div>
      </div>
      <div className="mt-[18px] flex items-center gap-[7px] border-t border-border pt-[15px] text-[13px] text-secondary-foreground">
        <Gift size={17} className="text-primary-hover" /> Prêmio-base:{' '}
        <strong>{prize} diamonds</strong>
      </div>
    </Card>
  );
}
