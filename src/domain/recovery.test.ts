import { calculateBudgetState } from './budget-engine';
import { BudgetConfig, Expense } from '../types';

describe('Recovery Mode', () => {
  // Helper to create a config
  const createConfig = (
    overrides: Partial<BudgetConfig> = {},
  ): BudgetConfig => ({
    income: 3000,
    fixedExpenses: 500,
    savingsPercentage: 0,
    ...overrides,
  });

  // Helper to create an expense
  const createExpense = (amount: number, date: Date): Expense => ({
    id: `test-${Date.now()}-${Math.random()}`,
    amount,
    originalAmount: amount,
    currency: 'ARS',
    timestamp: date.getTime(),
    name: 'Test expense',
  });

  it('should NOT be in recovery mode when no expenses', () => {
    const config = createConfig();
    const now = new Date(2024, 11, 15); // Dec 15

    const result = calculateBudgetState(config, [], now);

    expect(result.current.isRecoveryMode).toBe(false);
    expect(result.current.recoveryDetails.totalDebt).toBe(0);
  });

  it('should NOT be in recovery mode when spending within budget', () => {
    const config = createConfig();
    const now = new Date(2024, 11, 15); // Dec 15

    // Spend less than daily budget
    const expenses = [createExpense(50, now)];

    const result = calculateBudgetState(config, expenses, now);

    expect(result.current.isRecoveryMode).toBe(false);
  });

  it('should trigger recovery mode when overspending exceeds all available funds', () => {
    const config = createConfig();
    // Use day 1 to avoid accumulated savings
    const now = new Date(2024, 11, 1); // Dec 1

    // Daily budget is ~80 (2500/31). Spend way more than that on day 1 (no savings yet)
    const expenses = [createExpense(500, now)];

    const result = calculateBudgetState(config, expenses, now);

    // On day 1: no historical savings, daily budget ~80, spent 500 = massively overspent
    expect(result.current.isRecoveryMode).toBe(true);
    expect(result.current.recoveryDetails.totalDebt).toBeGreaterThan(0);
  });

  it('should calculate recovery quota capped at 30% of planned daily budget', () => {
    const config = createConfig();
    const now = new Date(2024, 11, 1); // Day 1 to avoid savings

    // Massive overspend
    const expenses = [createExpense(2000, now)];

    const result = calculateBudgetState(config, expenses, now);

    const maxQuota = result.plan.plannedDailyBudget * 0.3;
    expect(result.current.recoveryDetails.recoveryQuota).toBeLessThanOrEqual(
      maxQuota,
    );
  });
});
