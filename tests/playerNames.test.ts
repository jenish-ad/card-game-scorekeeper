import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validatePlayerNames } from '../src/features/marriage/playerNames';

test('trims seating-order names without changing the supplied draft', () => {
  const names = ['  Sita ', 'Ram', ' सीता '];
  assert.deepEqual(validatePlayerNames(names), {
    ok: true,
    playerNames: ['Sita', 'Ram', 'सीता'],
  });
  assert.equal(names[0], '  Sita ');
});

test('rejects missing players and blank names', () => {
  for (const names of [[], ['Sita', '   ']]) {
    assert.equal(validatePlayerNames(names).ok, false);
  }
});

test('rejects names that would be ambiguous on a scoreboard', () => {
  assert.equal(validatePlayerNames(['Sita', ' sita ']).ok, false);
});

test('accepts the name length boundary and rejects longer names', () => {
  assert.equal(validatePlayerNames(['S'.repeat(40)]).ok, true);
  assert.equal(validatePlayerNames(['S'.repeat(41)]).ok, false);
});
