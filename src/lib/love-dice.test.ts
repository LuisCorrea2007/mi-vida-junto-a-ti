import { test, expect } from 'bun:test';
import { DICE_LEVELS, DICE_PLACES, DICE_DURATIONS, diceCombinations, availableRolls, nextPlayer } from './love-dice';

for (const [level, deck] of Object.entries(DICE_LEVELS)) {
  test(`${level} contains at least 1000 unique complete options`, () => {
    const pool = diceCombinations(deck.actions, DICE_PLACES, DICE_DURATIONS);
    expect(pool.length).toBe(3000);
    expect(new Set(pool.map(r => `${r.action}|${r.place}|${r.seconds}`)).size).toBe(3000);
  });
}
test('requested home locations are present', () => {
  for (const place of ['en la cama', 'en el sofá', 'en la cocina, lejos del fuego', 'junto a la mesa']) expect(DICE_PLACES).toContain(place);
});
test('used options do not repeat and locked location stays fixed', () => {
  const pool = diceCombinations(['Abrazo', 'Beso'], ['Sofá', 'Cama'], [30, 60]);
  const used = pool.find(r => r.action === 'Abrazo' && r.place === 'Cama' && r.seconds === 30);
  if (!used) throw new Error('Missing fixture');
  const remaining = availableRolls(pool, [used.id], { place: 'Cama' });
  expect(remaining.length).toBe(3);
  expect(remaining.every(r => r.place === 'Cama' && r.id !== used.id)).toBe(true);
});
test('turns alternate between both partners', () => {
  expect(nextPlayer(0)).toBe(1);
  expect(nextPlayer(1)).toBe(0);
});