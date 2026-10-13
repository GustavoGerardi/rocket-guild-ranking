import type { GuildData } from '../types/guild.ts';

export const demoData: GuildData = {
  guild: 'Rocket',
  exportedAt: '2026-10-09 15:25:50',
  members: [
    {
      name: 'Alpha Rocket',
      rank: 'the Leader',
      level: 400,
      status: 'online',
      contribution: 12000,
      dailiesCompleted: 40,
    },
    {
      name: 'Silver Moon',
      rank: 'a Vice-Leader',
      level: 390,
      status: 'online',
      contribution: 9000,
      dailiesCompleted: 33,
    },
    {
      name: 'Bronze Star',
      rank: 'a Member',
      level: 350,
      status: 'offline',
      contribution: 7600,
      dailiesCompleted: 31,
    },
    {
      name: 'Night Runner',
      rank: 'a Member',
      level: 320,
      status: 'online',
      contribution: 5000,
      dailiesCompleted: 24,
    },
    {
      name: 'Daily Hunter',
      rank: 'a Member',
      level: 315,
      status: 'online',
      contribution: 3000,
      dailiesCompleted: 30,
    },
  ],
};
