import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { ritualPeriod } from './ritual-period';
test('daily rituals use the current local date', () => {
  assert.equal(ritualPeriod('daily', new Date(2026, 9, 9, 23)), '2026-10-09');
});
test('weekly rituals share a Monday period through Sunday', () => {
  assert.equal(ritualPeriod('weekly', new Date(2026, 9, 11)), '2026-10-05');
  assert.equal(ritualPeriod('weekly', new Date(2026, 9, 12)), '2026-10-12');
});