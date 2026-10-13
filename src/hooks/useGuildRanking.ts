import { useMemo } from 'react';
import { rankMembers } from '../utils/ranking.ts';
import { getCycleDeadline } from '../utils/dates.ts';
import type { GuildData, RankedMember } from '../types/guild.ts';

interface GuildRanking {
  ranked: RankedMember[];
  deadline: Date;
  top: RankedMember[];
}

export function useGuildRanking(guildData: GuildData | null): GuildRanking {
  const ranked = useMemo(
    () => rankMembers(guildData?.members ?? []),
    [guildData],
  );
  const deadline = useMemo(
    () => getCycleDeadline(guildData?.exportedAt, new Date()),
    [guildData],
  );
  return { ranked, deadline, top: ranked.slice(0, 3) };
}
