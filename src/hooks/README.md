# Hooks Documentation

This directory contains custom React hooks used throughout the application to encapsulate logic and state management.

## `useBudgetCalculations`

This is the core hook for the budgeting logic (the "brain" of the application). It takes the raw configuration and expenses and derives all the financial metrics displayed on the UI.

### Usage

```typescript
import { useBudgetCalculations } from './useBudgetCalculations';

const { config, expenses } = state;
const metrics = useBudgetCalculations(config, expenses);
```

### Inputs

| Parameter  | Type          | Description                                                                 |
| :--------- | :------------ | :-------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `config`   | `BudgetConfig | null`                                                                       | User's budget settings (income, fixed expenses, savings %). |
| `expenses` | `Expense[]`   | List of all variable expenses (Supabase records). Needs validation filters. |

### Core Concepts & Return Values

#### 1. Daily Metrics

- **`dailyBudget`**: The dynamic amount the user can spend today to finish the month with balance >= 0. It recalculates daily based on remaining money and days.
- **`plannedDailyBudget`**: The static "ideal" daily spend. Calculated as `(Disposable Income - Savings) / Days in Month`. Used as a baseline to measure over/under spending per day.
- **`effectiveDailyBudget`**: The actual spending limit for today shown to the user.
  - _Normal Mode_: Same as `dailyBudget`.
  - _Recovery Mode_: Reduced by `recoveryQuota` to pay back debt.

#### 2. Spending Status

- **`spentToday`**: Sum of expenses timestamped with today's date.
- **`spentCurrentMonth`**: Total variable expenses for the current month.
- **`accumulatedSavings`**: The running total of "saved" money from previous days of the month.
  - Calculation: For every past day `(Planned Daily Budget - Actual Spent)`.
  - Positive means you are under budget overall; negative means you overspent in the past.

* **`uiAccumulatedSavings`** (Internal variable exposed as `accumulatedSavings`):
  - This is the "safe" version of savings displayed to the user.
  - Unlike the raw accumulated value, this logic prioritizes **covering today's overspending first**.
  - _Why?_ If you have $50 saved from yesterday but spend $10 over budget today, the UI subtracts that $10 from your "Savings" bucket immediately (`accumulatedSavings - coveredBySavings`) rather than showing you still have $50 saved while your daily balance goes negative. It provides a more realistic view of _available_ savings.

#### 3. Recovery Mode Logic

The app enters **Recovery Mode** when the user's total balance (Accumulated Savings + Today's Budget - Today's Spend) drops below zero.

- **`isRecoveryMode`**: `true` if the user is in debt (negative balance).
- **`totalDebt`**: The absolute amount of money overspent (`Math.abs(currentTotalStatus)`).
- **`recoveryQuota`**: The daily "tax" applied to pay back the debt. Capped at 30% of the `plannedDailyBudget` to avoid suffocating the user.
- **`daysToRecover`**: Estimated days needed to clear the debt at the current `recoveryQuota` rate.

#### 4. Savings & Projections

- **`projectedSavings`**: Estimated total savings by month-end. Includes the fixed `monthlyFixedSavingsGoal` + current `accumulatedSavings` (if positive).
- **`monthlyFixedSavingsGoal`**: The target savings amount derived from the user's config (`Income * Savings %`).

### Key Implementation Details

- **Time Source**: Uses `new Date()` internally. Ensure the device time is correct.
- **Consistency**: Relies on `calculateBudgetMetrics` from `../domain/budget.ts` for the base math to ensure consistency with other parts of the app (like `MonthlySummaryCard` or `History`).
- **Math**: Uses `Math.floor` for budgets to be conservative (never suggest spending cents you might not have).
