import { CheckCircle2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from 'cn';
import { formatNumber } from '@/utils/formatters';
import type { RankedMember } from '@/types/guild';

interface RankingTableProps {
  ranked: RankedMember[];
}

export function RankingTable({ ranked }: RankingTableProps) {
  return (
    <section className="py-[54px] section-container">
      <div className="section-heading flex items-end justify-between gap-5 max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <p className="eyebrow">CLASSIFICAÇÃO COMPLETA</p>
          <h2>Ranking geral</h2>
        </div>
        <Badge
          variant="outline"
          className="h-auto whitespace-normal rounded-full border-primary/50 bg-primary/10 px-[13px] py-2.5 text-xs font-semibold text-secondary-foreground"
        >
          RP = Dailies ÷ 3 + Contribuição ÷ 1.000 + bônus
        </Badge>
      </div>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-border bg-card shadow-[0_20px_65px_rgba(0,0,0,.18)]">
        <Table className="min-w-[930px] border-collapse [&_th]:h-auto [&_th]:bg-secondary [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[.09em] [&_th]:text-muted-foreground [&_td]:border-t [&_td]:border-border [&_td]:px-4 [&_td]:py-[15px] [&_td]:text-sm [&_td]:text-secondary-foreground">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead>#</TableHead>
              <TableHead>Jogador</TableHead>
              <TableHead>Dailies</TableHead>
              <TableHead>Contribuição</TableHead>
              <TableHead>Pontos daily</TableHead>
              <TableHead>Pontos contrib.</TableHead>
              <TableHead>Bônus</TableHead>
              <TableHead>Próximo bônus</TableHead>
              <TableHead>Rocket Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranked.map((member, index) => (
              <TableRow
                key={`${member.name}-${index}`}
                className={cn(
                  'border-0 transition-colors duration-[180ms] hover:bg-secondary',
                  index < 3 &&
                    'bg-primary/10 shadow-[inset_3px_0_var(--color-primary)]',
                )}
              >
                <TableCell>
                  <Badge
                    className={cn(
                      'grid size-7 place-items-center rounded-[9px] border-0 p-0 text-xs font-semibold',
                      index < 3
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    {index + 1}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-[3px] [&>strong]:text-foreground [&>small]:text-[11px] [&>small]:text-muted-foreground">
                    <strong>{member.name}</strong>
                    <small>
                      Nv. {member.level ?? '—'} •{' '}
                      {member.status === 'online' ? 'Online' : 'Offline'}
                    </small>
                  </div>
                </TableCell>
                <TableCell>{member.dailiesCompleted}</TableCell>
                <TableCell>{formatNumber(member.contribution, 0)}</TableCell>
                <TableCell>{formatNumber(member.dailyPoints)}</TableCell>
                <TableCell>{formatNumber(member.contributionPoints)}</TableCell>
                <TableCell>
                  <Badge
                    variant={member.bonusPoints > 0 ? 'default' : 'outline'}
                    className={
                      member.bonusPoints > 0
                        ? 'border-0 font-semibold'
                        : 'text-muted-foreground'
                    }
                  >
                    +{formatNumber(member.bonusPoints)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.nextCheckpoint ? (
                    <span className="whitespace-nowrap text-xs text-secondary-foreground">
                      {member.nextCheckpoint.missingDailies > 0 &&
                        `${member.nextCheckpoint.missingDailies} daily${member.nextCheckpoint.missingDailies > 1 ? 's' : ''}`}
                      {member.nextCheckpoint.missingDailies > 0 &&
                        member.nextCheckpoint.missingContribution > 0 &&
                        ' + '}
                      {member.nextCheckpoint.missingContribution > 0 &&
                        `${formatNumber(member.nextCheckpoint.missingContribution, 0)} contrib.`}
                      {' → +'}
                      {member.nextCheckpoint.bonus} RP
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-[5px] whitespace-nowrap text-xs font-semibold text-secondary-foreground">
                      <CheckCircle2 size={14} className="text-primary-hover" />{' '}
                      Máximo
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <strong className="text-base text-foreground">
                    {formatNumber(member.totalPoints)}
                  </strong>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 flex items-center gap-[7px] text-xs text-muted-foreground">
        <Info size={15} /> Em caso de empate: mais dailies → maior contribuição
        → ordem alfabética.
      </p>
    </section>
  );
}
