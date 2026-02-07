import { calculateBudgetMetrics } from './budget';

describe('Budget Domain Logic', () => {
  const config = {
    income: 5000,
    fixedExpenses: 1000,
    savingsPercentage: 10, // 10% of (5000-1000) = 400
  };
  // Disposable: 4000. Savings: 400. Variable Budget: 3600.
  // 30 day month (June, Sept, Nov, April). Let's use Nov 2023.
  // Daily Plan: 3600 / 30 = 120.

  test('Start of month: Initial budget calculation', () => {
    const date = new Date(2023, 10, 1); // Nov 1st
    const metrics = calculateBudgetMetrics({
      config,
      totalSpent: 0,
      currentDate: date,
    });

    expect(metrics.monthlyVariableBudget).toBe(3600);
    expect(metrics.daysInMonth).toBe(30);
    expect(metrics.daysRemaining).toBe(30); // 30 - 1 + 1 = 30
    expect(metrics.dailySpendingPool).toBe(3600);
    expect(metrics.dailyBudget).toBe(120);
  });

  test('Mid month: Perfect spending maintains daily budget', () => {
    // Nov 16th.
    // Days in month: 30.
    // Current Day: 16.
    // Remaining: 30 - 16 + 1 = 15. (Including today)
    const date = new Date(2023, 10, 16);

    // Previous days: 15 (1st to 15th).
    // If we spent 120 * 15 = 1800.
    const metrics = calculateBudgetMetrics({
      config,
      totalSpent: 1800,
      currentDate: date,
    });

    expect(metrics.daysRemaining).toBe(15);
    expect(metrics.dailySpendingPool).toBe(1800); // 3600 - 1800
    expect(metrics.dailyBudget).toBe(120);
    expect(metrics.plannedDailyBudget).toBe(120);
  });

  test('Mid month: Overspending reduces daily budget (The Discrepancy Case)', () => {
    const date = new Date(2023, 10, 16); // 15 days remaining including today

    // User spent 2000 instead of 1800. (Overspent 200)
    // Remaining Pool: 3600 - 2000 = 1600.
    // New Daily target: 1600 / 15 = 106.666...

    const metrics = calculateBudgetMetrics({
      config,
      totalSpent: 2000,
      currentDate: date,
    });

    expect(metrics.dailySpendingPool).toBe(1600);
    expect(metrics.dailyBudget).toBe(106); // Math.floor(106.66) -> 106
    expect(metrics.plannedDailyBudget).toBe(120); // Should remain constant

    // If we used the "Original Daily Budget" it would still be 120.
    // The user saw 87 (Static/Original?) vs 84 (Dynamic).
    // This confirms that if the UI uses a static value calculated at start, vs dynamic, they diverge.
  });

  test('Month End: Under Budget Increases Daily', () => {
    const date = new Date(2023, 10, 30); // Last day.
    // Remaining: 1.

    // Suppose we only spent 3000 total so far. (Budget was 3600).
    // Remaining Pool: 600.
    const metrics = calculateBudgetMetrics({
      config,
      totalSpent: 3000,
      currentDate: date,
    });

    expect(metrics.daysRemaining).toBe(1);
    expect(metrics.dailySpendingPool).toBe(600);
    expect(metrics.dailyBudget).toBe(600);
  });

  test("Intra-day: Spending today does not lower today's daily budget", () => {
    // Nov 1st. Budget 3600 / 30 = 120.
    const date = new Date(2023, 10, 1);

    // Scenario 1: Start of day (0 spent)
    const startMetrics = calculateBudgetMetrics({
      config,
      totalSpent: 0,
      currentDate: date,
      spentToday: 0,
    });
    expect(startMetrics.dailyBudget).toBe(120);

    // Scenario 2: Spent 50 during the day
    const midDayMetrics = calculateBudgetMetrics({
      config,
      totalSpent: 50, // Total includes today's spend
      currentDate: date,
      spentToday: 50, // We identify 50 was spent today
    });

    // The daily budget should REMAIN 120.
    // Calculation: (3600 - (50 - 50)) / 30 = 3600 / 30 = 120.
    expect(midDayMetrics.dailyBudget).toBe(120);

    // However, the dailySpendingPool (Actual Remaining Money) should reflect the spend.
    expect(midDayMetrics.dailySpendingPool).toBe(3550);
  });
});
