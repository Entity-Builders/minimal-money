import { useState } from 'react';
import { useBudget } from '../context/useBudget';

export const useOnboarding = () => {
  const { addBatch } = useBudget();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('Supermercado');
  const [icon, setIcon] = useState('🛒');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  const finishOnboarding = async () => {
    const limit = parseFloat(monthlyLimit) || 0;
    if (!name || limit <= 0) return;

    setLoading(true);
    await addBatch(name, icon, limit);
    setLoading(false);
  };

  return {
    name,
    setName,
    icon,
    setIcon,
    monthlyLimit,
    setMonthlyLimit,
    loading,
    finishOnboarding,
  };
};
