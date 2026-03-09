---
name: "Minimal Money"
tagline: "Personal expense tracking made simple"
platform: "iOS / Android"
status: "active"
category: "finance"
icon: "💰"
features:
  - "Expense tracking and categorization"
  - "Budget management"
  - "Financial calculations"
downloadUrl: ""
visible: true
---

# Minimal Money

> Personal expense tracking app.

## Overview

| Field         | Value                               |
| ------------- | ----------------------------------- |
| **Platform**  | iOS / Android (Expo + React Native) |
| **Workspace** | `apps/minimal-money`                |
| **Status**    | Active                              |

## Key Features

- Expense tracking and categorization
- Budget management
- Financial calculations via `@eb-packages/logic`

## Tech Stack

- **Framework**: Expo (React Native)
- **Backend**: Supabase (Auth, Postgres)
- **Logic**: `@eb-packages/logic` (budgetService, calculations)

## Running

```bash
cd apps/minimal-money
yarn start
yarn ios     # iOS Simulator
yarn android # Android Emulator
```

## Related

- [Logic Package](../packages/logic.md)
- [Expense Flow](../flows/expense-flow.md)
