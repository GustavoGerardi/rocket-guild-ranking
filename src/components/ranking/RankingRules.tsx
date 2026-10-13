import { useState } from 'react';
import {
  Award,
  CalendarClock,
  ChevronDown,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RULES } from '@/utils/ranking';
import { formatNumber } from '@/utils/formatters';
import { cn } from 'cn';

const ruleCardClassName =
  'flex flex-row gap-3.5 rounded-[18px] border border-border bg-card p-5 text-primary-hover shadow-none [&_h3]:mb-[7px] [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_p]:text-sm [&_p]:leading-[1.6] [&_p]:text-secondary-foreground';

export function RankingRules() {
  const [showRules, setShowRules] = useState(true);
  return (
    <section className="pt-6 pb-[60px] section-container">
      <Button
        variant="outline"
        className="flex h-auto w-full items-center justify-between rounded-[18px] border border-border bg-secondary px-5 py-[18px] text-base font-semibold text-foreground hover:bg-secondary [&_span]:flex [&_span]:items-center [&_span]:gap-2.5 [&_svg]:size-auto [&_svg]:transition-transform [&_svg]:duration-200"
        onClick={() => setShowRules((value) => !value)}
        aria-expanded={showRules}
      >
        <span>
          <ShieldCheck size={22} /> Regras e transparência
        </span>
        <ChevronDown size={20} className={showRules ? 'rotate-180' : ''} />
      </Button>

      {showRules && (
        <div className="mt-3.5 grid gap-3.5">
          <Card className={cn(ruleCardClassName, 'border-primary/60 bg-card')}>
            <Sparkles size={24} />
            <div>
              <h3>Como os pontos são calculados?</h3>
              <p>
                <strong>1 ponto a cada 3 dailies</strong> e{' '}
                <strong>1 ponto a cada 1.000 de contribuição</strong>, somados
                aos checkpoints alcançados.
              </p>
              <div className="example-box">
                <span>Exemplo</span>
                <strong>40 dailies + 12.000 contribuição</strong>
                <p>
                  13,33 + 12 + (1 + 2 + 3 + 4) = <b>35,33 RP</b>
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
            {RULES.checkpoints.map((checkpoint, index) => (
              <Card
                className="relative block gap-0 overflow-hidden rounded-[18px] border border-border bg-card p-[18px] shadow-none [&_h3]:mt-[18px] [&_h3]:mb-[3px] [&_h3]:text-lg [&_h3]:font-bold [&_p]:text-[13px] [&_p]:text-muted-foreground [&_strong]:mt-3.5 [&_strong]:inline-block [&_strong]:text-foreground"
                key={checkpoint.label}
              >
                <span className="grid size-[30px] place-items-center rounded-[10px] bg-primary font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <h3>{checkpoint.dailies} dailies</h3>
                <p>+ {formatNumber(checkpoint.contribution, 0)} contribuição</p>
                <strong>+{checkpoint.bonus} RP extra</strong>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3.5 max-[620px]:grid-cols-1">
            <Card className={ruleCardClassName}>
              <CircleDollarSign size={22} />
              <div>
                <h3>Teto competitivo</h3>
                <p>
                  Para manter o ranking justo, entram no cálculo no máximo{' '}
                  <strong>41 dailies</strong> e{' '}
                  <strong>12.000 de contribuição</strong>. Doações acima disso
                  continuam ajudando a guild, mas não aumentam o RP semanal.
                </p>
              </div>
            </Card>
            <Card className={ruleCardClassName}>
              <CalendarClock size={22} />
              <div>
                <h3>Fechamento semanal</h3>
                <p>
                  O ciclo termina <strong>todo domingo às 21h</strong> (
                  {RULES.timezoneLabel}). Na segunda-feira começa um ranking
                  novo.
                </p>
              </div>
            </Card>
            <Card className={ruleCardClassName}>
              <Trophy size={22} />
              <div>
                <h3>Premiação</h3>
                <p>
                  <strong>1º: 20D</strong> • <strong>2º: 15D</strong> •{' '}
                  <strong>3º: 10D</strong>. O jogador usa os diamonds como
                  quiser.
                </p>
              </div>
            </Card>
            <Card className={cn(ruleCardClassName, 'text-primary-hover')}>
              <Award size={22} />
              <div>
                <h3>Quando o prêmio não é entregue?</h3>
                <p>
                  O vencedor precisa estar presente no{' '}
                  <strong>boss de domingo às 21h</strong>. Se faltar, não recebe
                  naquela semana e o valor daquela colocação{' '}
                  <strong>acumula para a mesma posição</strong> na semana
                  seguinte.
                </p>
                <div className="example-box mt-2.5!">
                  <span>Exemplo</span>
                  <p>
                    3º lugar ausente → os 10D acumulam. Na semana seguinte, o 3º
                    lugar passa a valer <strong>20D</strong>.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}
