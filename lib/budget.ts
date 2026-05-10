// Budget-decay schedule with multi-query support.
//
// Highest layer (panel > team > agent) computes cap from round.
// Agents receive the cap and enforce it per-query against their output.
// Overflow handler mutates the output object directly (octoscript context).

const SCHEDULE = [7, 5, 3, 1, 0];

export function cap(round: number): number {
  if (round <= 0) return SCHEDULE[0];
  if (round > SCHEDULE.length) return SCHEDULE[SCHEDULE.length - 1];
  return SCHEDULE[round - 1];
}

export interface BudgetResult {
  cap: number;
  queries: Record<string, {
    query: string;
    total: number;
    kept: number;
    overflowed: number;
  }>;
}

export async function apply(
  output: unknown,
  budgetCap: number,
  queries: Record<string, string>,
  queryFn: (data: unknown, expr: string) => Promise<unknown>,
  overflowHandlers: Record<string, (overflow: unknown[], output: unknown) => void>,
): Promise<BudgetResult> {
  const result: BudgetResult = { cap: budgetCap, queries: {} };

  for (const [name, expr] of Object.entries(queries)) {
    const matches = await queryFn(output, expr);
    const items = Array.isArray(matches) ? matches : matches != null ? [matches] : [];
    const total = items.length;
    const kept = Math.min(total, budgetCap);
    const overflowed = total - kept;

    result.queries[name] = { query: expr, total, kept, overflowed };

    if (overflowed > 0) {
      const handler = overflowHandlers[name];
      if (!handler) {
        throw new Error("Budget overflow on '" + name + "' but no overflow handler provided");
      }
      handler(items.slice(budgetCap), output);
    }
  }

  return result;
}
