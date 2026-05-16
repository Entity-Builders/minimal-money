import { useState } from 'react';
import { useBudget } from '../context/useBudget';

export const useOnboarding = () => {
  const { addBatch } = useBudget();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('Supermercado');
  const [icon, setIcon] = useState('🛒');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  const finishOnboarding = async () => {
    const limit = parseFloat(monthlyLimit) || 0;
    if (!name || limit <= 0) return;

    setLoading(true);
    setError(null);
    const success = await addBatch(name, icon, limit);
    setLoading(false);
    
    if (success === false) {
      setError('Ocurrió un error creando el budget. Por favor intente nuevamente.');
    }
  };

  return {
    name,
    setName,
    icon,
    setIcon,
    monthlyLimit,
    setMonthlyLimit,
    loading,
    error,
    finishOnboarding,
  };
};
