import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { DICE_LEVELS, DICE_PLACES, DICE_DURATIONS, diceCombinations, availableRolls, nextPlayer } from './love-dice';

for (const [level, deck] of Object.entries(DICE_LEVELS)) {
  test(`${level} contains at least 1000 unique complete options`, () => {
    const pool = diceCombinations(deck.actions, DICE_PLACES, DICE_DURATIONS);
    assert.equal(pool.length, 3000);
    assert.equal(new Set(pool.map(r => `${r.action}|${r.place}|${r.seconds}`)).size, 3000);
  });
}
test('requested home locations are present', () => {
  for (const place of ['en la cama', 'en el sofá', 'en la cocina, lejos del fuego', 'junto a la mesa']) assert.ok(DICE_PLACES.includes(place));
});
test('used options do not repeat and locked location stays fixed', () => {
  const pool = diceCombinations(['Abrazo', 'Beso'], ['Sofá', 'Cama'], [30, 60]);
  const used = pool.find(r => r.action === 'Abrazo' && r.place === 'Cama' && r.seconds === 30);
  if (!used) throw new Error('Missing fixture');
  const remaining = availableRolls(pool, [used.id], { place: 'Cama' });
  assert.equal(remaining.length, 3);
  assert.ok(remaining.every(r => r.place === 'Cama' && r.id !== used.id));
});
test('turns alternate between both partners', () => {
  assert.equal(nextPlayer(0), 1);
  assert.equal(nextPlayer(1), 0);
});