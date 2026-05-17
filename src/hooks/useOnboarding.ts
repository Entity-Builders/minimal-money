import { useState } from 'react';
import { useBudget } from '../context/useBudget';
import { supabase } from '@eb-packages/logic';

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[useOnboarding] finishOnboarding called with name:', name, 'limit:', limit, 'by user:', user?.id);
    } catch (e) {
      console.error('[useOnboarding] Error fetching user:', e);
    }

    const result = await addBatch(name, icon, limit);
    setLoading(false);
    
    if (result && result.success === false) {
      console.error('[useOnboarding] addBatch failed with error:', result.error);
      setError(`Error: ${result.error}`);
    } else if (!result) {
      setError('Ocurrió un error inesperado al intentar crear el budget.');
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
