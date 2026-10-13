import type {
  GuildMember,
  RankedMember,
  RankingRules,
} from '../types/guild.ts';

export const RULES: RankingRules = {
  dailyDivisor: 3,
  contributionUnit: 1000,
  maxDailiesForPoints: 41,
  maxContributionForPoints: 12000,
  checkpoints: [
    { dailies: 10, contribution: 3000, bonus: 1, label: 'Checkpoint I' },
    { dailies: 20, contribution: 6000, bonus: 2, label: 'Checkpoint II' },
    { dailies: 30, contribution: 9000, bonus: 3, label: 'Checkpoint III' },
    { dailies: 40, contribution: 12000, bonus: 4, label: 'Checkpoint IV' },
  ],
  prizes: [20, 15, 10],
  deadlineHour: 21,
  deadlineWeekday: 'segunda-feira',
  timezoneLabel: 'horário de Brasília',
};

export function scoreMember(member: Partial<GuildMember>): RankedMember {
  const rawDailies = Number(member.dailiesCompleted ?? 0);
  const rawContribution = Number(member.contribution ?? 0);

  const scoredDailies = Math.min(
    Math.max(rawDailies, 0),
    RULES.maxDailiesForPoints,
  );
  const scoredContribution = Math.min(
    Math.max(rawContribution, 0),
    RULES.maxContributionForPoints,
  );

  const dailyPoints = scoredDailies / RULES.dailyDivisor;
  const contributionPoints = scoredContribution / RULES.contributionUnit;

  const unlockedCheckpoints = RULES.checkpoints.filter(
    (checkpoint) =>
      rawDailies >= checkpoint.dailies &&
      rawContribution >= checkpoint.contribution,
  );
  const bonusPoints = unlockedCheckpoints.reduce(
    (sum, checkpoint) => sum + checkpoint.bonus,
    0,
  );
  const nextCheckpoint = RULES.checkpoints.find(
    (checkpoint) =>
      rawDailies < checkpoint.dailies ||
      rawContribution < checkpoint.contribution,
  );

  return {
    ...member,
    dailiesCompleted: rawDailies,
    contribution: rawContribution,
    dailyPoints,
    contributionPoints,
    bonusPoints,
    totalPoints: dailyPoints + contributionPoints + bonusPoints,
    checkpoints: unlockedCheckpoints,
    nextCheckpoint: nextCheckpoint
      ? {
          ...nextCheckpoint,
          missingDailies: Math.max(0, nextCheckpoint.dailies - rawDailies),
          missingContribution: Math.max(
            0,
            nextCheckpoint.contribution - rawContribution,
          ),
        }
      : null,
  };
}

export function rankMembers(members: GuildMember[]): RankedMember[] {
  return members.map(scoreMember).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.dailiesCompleted !== a.dailiesCompleted)
      return b.dailiesCompleted - a.dailiesCompleted;
    if (b.contribution !== a.contribution)
      return b.contribution - a.contribution;
    return String(a.name).localeCompare(String(b.name), 'pt-BR');
  });
}
