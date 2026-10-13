import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RULES, rankMembers, scoreMember } from '../src/utils/ranking.ts';
import { validateGuildJson } from '../src/utils/guildJson.ts';
import { getCycleDeadline, parseExportDate } from '../src/utils/dates.ts';
import { dateLabel, formatNumber } from '../src/utils/formatters.ts';

test('checkpoints require both thresholds and award cumulative bonuses', () => {
  for (const [index, checkpoint] of RULES.checkpoints.entries()) {
    const complete = scoreMember({
      dailiesCompleted: checkpoint.dailies,
      contribution: checkpoint.contribution,
    });
    assert.equal(
      complete.bonusPoints,
      RULES.checkpoints
        .slice(0, index + 1)
        .reduce((sum, item) => sum + item.bonus, 0),
    );
    for (const member of [
      {
        dailiesCompleted: checkpoint.dailies - 1,
        contribution: checkpoint.contribution,
      },
      {
        dailiesCompleted: checkpoint.dailies,
        contribution: checkpoint.contribution - 1,
      },
    ]) {
      const result = scoreMember(member);
      assert.equal(result.checkpoints.length, index);
      assert.ok(result.nextCheckpoint);
      assert.equal(result.nextCheckpoint.label, checkpoint.label);
      assert.equal(
        result.nextCheckpoint.missingDailies +
          result.nextCheckpoint.missingContribution,
        1,
      );
    }
  }
});

test('caps limit points while raw values remain available for display and tie breaks', () => {
  const members = [
    { name: 'A', dailiesCompleted: 41, contribution: 13000 },
    { name: 'C', dailiesCompleted: 42, contribution: 12000 },
    { name: 'B', dailiesCompleted: 41, contribution: 14000 },
  ];
  const ranked = rankMembers(members);
  assert.deepEqual(
    ranked.map((member) => member.name),
    ['C', 'B', 'A'],
  );
  assert.equal(ranked[0].dailiesCompleted, 42);
  assert.equal(ranked[1].contribution, 14000);
  assert.ok(ranked.every((member) => member.totalPoints === 41 / 3 + 12 + 10));
  assert.ok(ranked.every((member) => member.nextCheckpoint === null));
  assert.deepEqual(
    members.map((member) => member.name),
    ['A', 'C', 'B'],
  );
});

test('complete ties use alphabetical order; negative and missing inputs retain their scoring behavior', () => {
  assert.deepEqual(
    rankMembers([
      { name: 'Z', dailiesCompleted: 10, contribution: 3000 },
      { name: 'A', dailiesCompleted: 10, contribution: 3000 },
    ]).map((member) => member.name),
    ['A', 'Z'],
  );
  const negative = scoreMember({ dailiesCompleted: -5, contribution: -100 });
  assert.equal(negative.totalPoints, 0);
  assert.equal(negative.dailiesCompleted, -5);
  assert.ok(negative.nextCheckpoint);
  assert.equal(negative.nextCheckpoint.missingDailies, 15);
  assert.equal(scoreMember({}).totalPoints, 0);
});

test('JSON validation preserves coercion, extra fields and error messages', () => {
  assert.equal(
    validateGuildJson(null),
    'O arquivo não contém um objeto JSON válido.',
  );
  assert.equal(
    validateGuildJson({}),
    'O JSON precisa conter o campo "members" como uma lista.',
  );
  assert.equal(
    validateGuildJson({ members: [] }),
    'A lista "members" está vazia.',
  );
  assert.equal(
    validateGuildJson({
      members: [
        {
          name: 'Player',
          dailiesCompleted: '20',
          contribution: '6000',
          extra: true,
        },
      ],
    }),
    null,
  );
  assert.equal(
    validateGuildJson({
      members: [
        { name: 'Player', dailiesCompleted: 'invalid', contribution: 6000 },
      ],
    }),
    'O jogador Player está sem name, dailiesCompleted ou contribution válido.',
  );
  assert.equal(
    validateGuildJson({
      members: [{ name: 'Player', dailiesCompleted: null, contribution: null }],
    }),
    null,
  );
});

test('cycle closes on Sunday at the original local time, including Sunday exports and fallback dates', () => {
  for (const exportedAt of [
    '2026-10-05 15:00:00',
    '2026-10-09 15:25:50',
    '2026-10-11 23:00:00',
  ]) {
    const deadline = getCycleDeadline(exportedAt, new Date(2026, 9, 9));
    assert.deepEqual(
      [
        deadline.getFullYear(),
        deadline.getMonth(),
        deadline.getDate(),
        deadline.getDay(),
        deadline.getHours(),
      ],
      [2026, 9, 11, 0, 21],
    );
  }
  const fallback = new Date(2026, 9, 12, 9);
  assert.equal(getCycleDeadline('invalid', fallback).getDate(), 18);
  assert.equal(fallback.getDate(), 12);
  assert.equal(parseExportDate(undefined), null);
  assert.equal(parseExportDate('invalid'), null);
  assert.equal(dateLabel(new Date(2026, 9, 11, 12)), 'domingo, 11/10/2026');
});

test('formatters preserve Brazilian number and point formatting', () => {
  assert.equal(formatNumber(35.333333333333336), '35,33');
  assert.equal(formatNumber(12000, 0), '12.000');
});
