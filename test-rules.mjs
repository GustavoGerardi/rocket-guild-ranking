import assert from 'node:assert/strict';
import { rankMembers, scoreMember } from './src/rules.js';

const maxExample = scoreMember({ name: 'Max', dailiesCompleted: 40, contribution: 12000 });
assert.equal(maxExample.dailyPoints, 40 / 3);
assert.equal(maxExample.contributionPoints, 12);
assert.equal(maxExample.bonusPoints, 10);
assert.ok(Math.abs(maxExample.totalPoints - 35.333333333333336) < 1e-10);

const capped = scoreMember({ name: 'Cap', dailiesCompleted: 99, contribution: 50000 });
assert.equal(capped.dailyPoints, 41 / 3);
assert.equal(capped.contributionPoints, 12);
assert.equal(capped.bonusPoints, 10);

const balanced = scoreMember({ name: 'Balanced', dailiesCompleted: 20, contribution: 6000 });
assert.equal(balanced.bonusPoints, 3); // +1 e +2 cumulativos

const ranked = rankMembers([
  { name: 'B', dailiesCompleted: 15, contribution: 5000 },
  { name: 'A', dailiesCompleted: 18, contribution: 4000 },
]);
assert.equal(ranked[0].name, 'A'); // mesmo RP aproximado; desempate por dailies

console.log('Regras validadas com sucesso.');
