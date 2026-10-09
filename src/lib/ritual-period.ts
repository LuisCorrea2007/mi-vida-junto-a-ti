/** Local calendar periods, rather than UTC dates, keep daily checkmarks consistent. */
export function ritualPeriod(cadence: string, date = new Date()): string {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (cadence === 'weekly') local.setDate(local.getDate() - (local.getDay() + 6) % 7);
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
}