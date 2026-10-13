import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import {
  Award,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Crown,
  FileJson,
  Gift,
  Info,
  Medal,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  XCircle,
} from 'lucide-react';
import { RULES, rankMembers } from './rules';
import './styles.css';

const IMPORT_SEQUENCE = ['ArrowUp', 'ArrowRight', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowLeft'];
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const demoData = {
  guild: 'Rocket',
  exportedAt: '2026-10-09 15:25:50',
  members: [
    { name: 'Alpha Rocket', rank: 'the Leader', level: 400, status: 'online', contribution: 12000, dailiesCompleted: 40 },
    { name: 'Silver Moon', rank: 'a Vice-Leader', level: 390, status: 'online', contribution: 9000, dailiesCompleted: 33 },
    { name: 'Bronze Star', rank: 'a Member', level: 350, status: 'offline', contribution: 7600, dailiesCompleted: 31 },
    { name: 'Night Runner', rank: 'a Member', level: 320, status: 'online', contribution: 5000, dailiesCompleted: 24 },
    { name: 'Daily Hunter', rank: 'a Member', level: 315, status: 'online', contribution: 3000, dailiesCompleted: 30 },
  ],
};

function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits }).format(value);
}

function parseExportDate(value) {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
}

function getCycleDeadline(exportedAt) {
  const base = parseExportDate(exportedAt) ?? new Date();
  const day = base.getDay();
  const daysUntilSunday = (7 - day) % 7;
  const deadline = new Date(base);
  deadline.setDate(base.getDate() + daysUntilSunday);
  deadline.setHours(RULES.deadlineHour, 0, 0, 0);
  return deadline;
}

function dateLabel(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function validateGuildJson(data) {
  if (!data || typeof data !== 'object') return 'O arquivo não contém um objeto JSON válido.';
  if (!Array.isArray(data.members)) return 'O JSON precisa conter o campo "members" como uma lista.';
  if (!data.members.length) return 'A lista "members" está vazia.';

  const invalid = data.members.find(
    (member) =>
      typeof member.name !== 'string' ||
      Number.isNaN(Number(member.dailiesCompleted)) ||
      Number.isNaN(Number(member.contribution)),
  );

  if (invalid) {
    return `O jogador ${invalid.name || '(sem nome)'} está sem name, dailiesCompleted ou contribution válido.`;
  }

  return null;
}

function PodiumCard({ member, place, prize }) {
  const variants = {
    1: { className: 'gold', icon: Crown, label: '1º lugar' },
    2: { className: 'silver', icon: Medal, label: '2º lugar' },
    3: { className: 'bronze', icon: Award, label: '3º lugar' },
  };
  const variant = variants[place];
  const Icon = variant.icon;

  if (!member) return null;

  return (
    <article className={`podium-card ${variant.className} place-${place}`}>
      <div className="podium-glow" />
      <div className="podium-rank">
        <Icon size={place === 1 ? 34 : 28} strokeWidth={1.8} />
        <span>{variant.label}</span>
      </div>
      <h3>{member.name}</h3>
      <div className="score-pill">
        <span>{formatNumber(member.totalPoints)}</span>
        <small>Rocket Points</small>
      </div>
      <div className="podium-stats">
        <div><strong>{member.dailiesCompleted}</strong><span>Dailies</span></div>
        <div><strong>{formatNumber(member.contribution, 0)}</strong><span>Contribuição</span></div>
        <div><strong>+{formatNumber(member.bonusPoints)}</strong><span>Bônus</span></div>
      </div>
      <div className="prize-line"><Gift size={17} /> Prêmio-base: <strong>{prize} diamonds</strong></div>
    </article>
  );
}

function App() {
  const [guildData, setGuildData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [storageMessage, setStorageMessage] = useState('');
  const [showRules, setShowRules] = useState(true);
  const [importUnlocked, setImportUnlocked] = useState(false);
  const inputRef = useRef(null);
  const localDataLoaded = useRef(false);

  useEffect(() => {
    let sequencePosition = 0;

    function handleKeyDown(event) {
      if (event.repeat) return;

      if (event.key === IMPORT_SEQUENCE[sequencePosition]) {
        sequencePosition += 1;
        if (sequencePosition === IMPORT_SEQUENCE.length) {
          setImportUnlocked(true);
          sequencePosition = 0;
        }
      } else {
        sequencePosition = event.key === IMPORT_SEQUENCE[0] ? 1 : 0;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    async function loadLatestImport() {
      const { data, error: loadError } = await supabase
        .from('guild_imports')
        .select('data, file_name')
        .eq('id', 'latest')
        .maybeSingle();

      if (!active || localDataLoaded.current) return;
      if (loadError) {
        setError(`Não foi possível carregar o último JSON do Supabase: ${loadError.message}`);
        return;
      }
      if (!data) return;

      const validationError = validateGuildJson(data.data);
      if (validationError) {
        setError(`O último JSON salvo no Supabase é inválido: ${validationError}`);
        return;
      }

      setGuildData(data.data);
      setFileName(data.file_name || 'ultimo-import.json');
      setStorageMessage('Último JSON carregado do Supabase.');
    }

    loadLatestImport();
    return () => {
      active = false;
    };
  }, []);

  const ranked = useMemo(() => rankMembers(guildData?.members ?? []), [guildData]);
  const deadline = useMemo(() => getCycleDeadline(guildData?.exportedAt), [guildData]);

  async function onFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const validationError = validateGuildJson(parsed);
      if (validationError) throw new Error(validationError);
      localDataLoaded.current = true;
      setGuildData(parsed);
      setFileName(file.name);
      setError('');
      if (!supabase) {
        setStorageMessage('Supabase não configurado; este JSON ficará disponível apenas nesta sessão.');
      } else {
        setStorageMessage('Salvando último JSON no Supabase...');
        const { error: saveError } = await supabase.from('guild_imports').upsert({
          id: 'latest',
          data: parsed,
          file_name: file.name,
          imported_at: new Date().toISOString(),
        });
        if (saveError) throw saveError;
        setStorageMessage('Último JSON salvo no Supabase.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível ler o arquivo.');
      setStorageMessage('');
    } finally {
      event.target.value = '';
    }
  }

  function loadDemo() {
    localDataLoaded.current = true;
    setGuildData(demoData);
    setFileName('exemplo-demonstrativo.json');
    setError('');
    setStorageMessage('');
  }

  const top = ranked.slice(0, 3);

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="hero container">
        <div className="brand-lockup">
          <div className="brand-icon"><Rocket size={28} /></div>
          <div>
            <p className="eyebrow">GUILD ROCKET • RANKING SEMANAL</p>
            <h1>Performance que vira <span>recompensa.</span></h1>
          </div>
        </div>
        <p className="hero-copy">
          Importe o JSON da guild e veja o ranking calculado automaticamente com dailies,
          contribuição e bônus de equilíbrio.
        </p>

        <div className="import-panel">
          {importUnlocked && (
            <>
              <input ref={inputRef} type="file" accept="application/json,.json" onChange={onFileChange} hidden />
              <button className="primary-button" onClick={() => inputRef.current?.click()}>
                <Upload size={19} /> Importar JSON da guild
              </button>
            </>
          )}
          <button className="ghost-button" onClick={loadDemo}>
            <FileJson size={18} /> Ver exemplo
          </button>
          <div className="file-status">
            {fileName ? <><CheckCircle2 size={16} /> {fileName}</> : 'Nenhum arquivo carregado'}
          </div>
        </div>
        {error && <div className="error-box"><XCircle size={18} /> {error}</div>}
        {storageMessage && <p className="storage-status" aria-live="polite">{storageMessage}</p>}
      </header>

      {!guildData ? (
        <section className="empty-state container">
          <div className="empty-orbit"><Trophy size={45} /></div>
          <h2>Seu ranking começa com um JSON</h2>
          <p>O arquivo precisa ter uma lista <code>members</code> com, pelo menos, <code>name</code>, <code>dailiesCompleted</code> e <code>contribution</code>.</p>
        </section>
      ) : (
        <>
          <section className="cycle-bar container">
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
              <strong>Boss de domingo • 21h</strong>
            </div>
          </section>

          <section className="podium-section container">
            <div className="section-heading centered">
              <p className="eyebrow">DESTAQUES DA SEMANA</p>
              <h2>Top 3 Rocket</h2>
              <p>Os três maiores Rocket Points no momento.</p>
            </div>
            <div className="podium-grid">
              <PodiumCard member={top[1]} place={2} prize={RULES.prizes[1]} />
              <PodiumCard member={top[0]} place={1} prize={RULES.prizes[0]} />
              <PodiumCard member={top[2]} place={3} prize={RULES.prizes[2]} />
            </div>
          </section>

          <section className="ranking-section container">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">CLASSIFICAÇÃO COMPLETA</p>
                <h2>Ranking geral</h2>
              </div>
              <div className="formula-chip">RP = Dailies ÷ 3 + Contribuição ÷ 1.000 + bônus</div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jogador</th>
                    <th>Dailies</th>
                    <th>Contribuição</th>
                    <th>Pontos daily</th>
                    <th>Pontos contrib.</th>
                    <th>Bônus</th>
                    <th>Próximo bônus</th>
                    <th>Rocket Points</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((member, index) => (
                    <tr key={`${member.name}-${index}`} className={index < 3 ? `rank-row rank-${index + 1}` : ''}>
                      <td><span className="position-badge">{index + 1}</span></td>
                      <td>
                        <div className="player-cell">
                          <strong>{member.name}</strong>
                          <small>Nv. {member.level ?? '—'} • {member.status === 'online' ? 'Online' : 'Offline'}</small>
                        </div>
                      </td>
                      <td>{member.dailiesCompleted}</td>
                      <td>{formatNumber(member.contribution, 0)}</td>
                      <td>{formatNumber(member.dailyPoints)}</td>
                      <td>{formatNumber(member.contributionPoints)}</td>
                      <td><span className={member.bonusPoints > 0 ? 'bonus-positive' : 'muted'}>+{formatNumber(member.bonusPoints)}</span></td>
                      <td>
                        {member.nextCheckpoint ? (
                          <span className="next-goal">
                            {member.nextCheckpoint.missingDailies > 0 && `${member.nextCheckpoint.missingDailies} daily${member.nextCheckpoint.missingDailies > 1 ? 's' : ''}`}
                            {member.nextCheckpoint.missingDailies > 0 && member.nextCheckpoint.missingContribution > 0 && ' + '}
                            {member.nextCheckpoint.missingContribution > 0 && `${formatNumber(member.nextCheckpoint.missingContribution, 0)} contrib.`}
                            {' → +'}{member.nextCheckpoint.bonus} RP
                          </span>
                        ) : (
                          <span className="max-goal"><CheckCircle2 size={14} /> Máximo</span>
                        )}
                      </td>
                      <td><strong className="total-score">{formatNumber(member.totalPoints)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="tie-breaker"><Info size={15} /> Em caso de empate: mais dailies → maior contribuição → ordem alfabética.</p>
          </section>

          <section className="rules-section container">
            <button className="rules-toggle" onClick={() => setShowRules((value) => !value)} aria-expanded={showRules}>
              <span><ShieldCheck size={22} /> Regras e transparência</span>
              <ChevronDown size={20} className={showRules ? 'rotate' : ''} />
            </button>

            {showRules && (
              <div className="rules-content">
                <div className="rule-card highlight-rule">
                  <Sparkles size={24} />
                  <div>
                    <h3>Como os pontos são calculados?</h3>
                    <p><strong>1 ponto a cada 3 dailies</strong> e <strong>1 ponto a cada 1.000 de contribuição</strong>, somados aos checkpoints alcançados.</p>
                    <div className="example-box">
                      <span>Exemplo</span>
                      <strong>40 dailies + 12.000 contribuição</strong>
                      <p>13,33 + 12 + (1 + 2 + 3 + 4) = <b>35,33 RP</b></p>
                    </div>
                  </div>
                </div>

                <div className="checkpoints-grid">
                  {RULES.checkpoints.map((checkpoint, index) => (
                    <article className="checkpoint-card" key={checkpoint.label}>
                      <span className="checkpoint-index">{index + 1}</span>
                      <h3>{checkpoint.dailies} dailies</h3>
                      <p>+ {formatNumber(checkpoint.contribution, 0)} contribuição</p>
                      <strong>+{checkpoint.bonus} RP extra</strong>
                    </article>
                  ))}
                </div>

                <div className="rule-grid">
                  <article className="rule-card">
                    <CircleDollarSign size={22} />
                    <div>
                      <h3>Teto competitivo</h3>
                      <p>Para manter o ranking justo, entram no cálculo no máximo <strong>41 dailies</strong> e <strong>12.000 de contribuição</strong>. Doações acima disso continuam ajudando a guild, mas não aumentam o RP semanal.</p>
                    </div>
                  </article>
                  <article className="rule-card">
                    <CalendarClock size={22} />
                    <div>
                      <h3>Fechamento semanal</h3>
                      <p>O ciclo termina <strong>todo domingo às 21h</strong> ({RULES.timezoneLabel}). Na segunda-feira começa um ranking novo.</p>
                    </div>
                  </article>
                  <article className="rule-card">
                    <Trophy size={22} />
                    <div>
                      <h3>Premiação</h3>
                      <p><strong>1º: 20D</strong> • <strong>2º: 15D</strong> • <strong>3º: 10D</strong>. O jogador usa os diamonds como quiser.</p>
                    </div>
                  </article>
                  <article className="rule-card danger-rule">
                    <Award size={22} />
                    <div>
                      <h3>Quando o prêmio não é entregue?</h3>
                      <p>O vencedor precisa estar presente no <strong>boss de domingo às 21h</strong>. Se faltar, não recebe naquela semana e o valor daquela colocação <strong>acumula para a mesma posição</strong> na semana seguinte.</p>
                      <div className="example-box compact">
                        <span>Exemplo</span>
                        <p>3º lugar ausente → os 10D acumulam. Na semana seguinte, o 3º lugar passa a valer <strong>20D</strong>.</p>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <footer className="container footer">
        <span><Rocket size={16} /> Rocket Guild Ranking</span>
        <span>Transparência, participação e recompensa.</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
