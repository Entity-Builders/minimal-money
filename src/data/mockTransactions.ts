import { Transaction } from '../types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: -2500,
    currency: 'ARS',
    timestamp: new Date().setMinutes(new Date().getMinutes() - 10), // 10 mins ago
  },
  {
    id: '2',
    amount: -12.5,
    currency: 'USD',
    timestamp: new Date().setHours(new Date().getHours() - 2), // 2 hours ago
  },
  {
    id: '3',
    amount: -850,
    currency: 'ARS',
    timestamp: new Date().setHours(new Date().getHours() - 5),
  },
  {
    id: '4',
    amount: -3200,
    currency: 'ARS',
    timestamp: new Date().setHours(new Date().getHours() - 12),
  },
  {
    id: '5',
    amount: -500,
    currency: 'ARS',
    timestamp: new Date().setDate(new Date().getDate() - 1), // Yesterday (should ideally be filtered out for "Today" view but good for edge cases)
  },
];
