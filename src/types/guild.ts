// JSON values stay unchanged when imported and persisted, including numeric strings.
export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json | undefined };

export interface GuildMember {
  name: string;
  dailiesCompleted: Json;
  contribution: Json;
  level?: number | string | null;
  status?: string;
  rank?: string;
  [key: string]: Json | undefined;
}

export interface GuildData {
  guild?: string;
  exportedAt?: string;
  members: GuildMember[];
  [key: string]: Json | undefined;
}

export interface Checkpoint {
  dailies: number;
  contribution: number;
  bonus: number;
  label: string;
}

export interface NextCheckpoint extends Checkpoint {
  missingDailies: number;
  missingContribution: number;
}

export interface RankedMember {
  name?: string;
  level?: number | string | null;
  status?: string;
  rank?: string;
  dailiesCompleted: number;
  contribution: number;
  dailyPoints: number;
  contributionPoints: number;
  bonusPoints: number;
  totalPoints: number;
  checkpoints: Checkpoint[];
  nextCheckpoint: NextCheckpoint | null;
  [key: string]: unknown;
}

export interface RankingRules {
  dailyDivisor: number;
  contributionUnit: number;
  maxDailiesForPoints: number;
  maxContributionForPoints: number;
  checkpoints: Checkpoint[];
  prizes: [number, number, number];
  deadlineHour: number;
  deadlineWeekday: string;
  timezoneLabel: string;
}
