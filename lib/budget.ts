// Budget-decay schedule. Pure math — no I/O, no opinions on data source.
// Consumer determines the round, this module computes the budget.
//
// Decay: 7 → 5 → 3 → 1 → 0

const SCHEDULE = [7, 5, 3, 1, 0];

export function budget(round: number): number {
  if (round <= 0) return SCHEDULE[0];
  if (round > SCHEDULE.length) return SCHEDULE[SCHEDULE.length - 1];
  return SCHEDULE[round - 1];
}
