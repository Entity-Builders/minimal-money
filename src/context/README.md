# Budget Context & Reducer

This module manages the global state of the application's budget. It uses a **Reducer** pattern to handle state update complexity, specifically for updates that have side effects on the configuration (such as fixed expenses).

## State Structure (`BudgetState`)

The state holds critical user information for the current session:

- **user**: Authenticated Supabase user.
- **config**: Budget configuration (income, total fixed expenses, savings %).
- **expenses**: List of expenses for the current month.
- **fixedExpensesList**: Detailed list of fixed expenses.
- **loading**: Initial loading state.

## Reducer Logic

The `budgetReducer` maintains data consistency. Key points:

### Fixed Expenses Management
One of the most critical logic pieces is the synchronization between the **fixed expenses list** and the **total** stored in the configuration.

When `ADD_FIXED_EXPENSE` or `REMOVE_FIXED_EXPENSE` is triggered:
1. We update the `fixedExpensesList`.
2. We **automatically recalculate** the total by summing the items in the new list.
3. We update `state.config.fixedExpenses` with this new total.

This ensures there is never a discrepancy between the items displayed in the list and the number used for daily budget calculations.

### Main Actions

| Action | Description |
|--------|-------------|
| `SET_DATA` | Hydrates initial state with Supabase data (profile, expenses, config). |
| `ADD_EXPENSE` | Adds an expense to the local list (optimistic update or post-confirmation). |
| `REMOVE_EXPENSE` | Removes an expense by ID. |
| `SET_CONFIG` | Updates income or percentage configuration. |

## Usage

The state and actions are consumed via `useBudget` in `BudgetProvider`.
