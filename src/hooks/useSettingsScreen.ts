import { useState } from 'react';
import { useBudget } from '../context/useBudget';
import { supabase, generateBudgetIcon } from '@entity-builders/logic';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

export const useSettingsScreen = () => {
  const { user, batches, addBatch, removeBatch, leaveBatch, refreshData, resetData } = useBudget();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetData(); // Clear local state
  };

  const handleCreateBatch = async (): Promise<{ success: boolean; error?: string }> => {
    const numericLimit = parseFloat(limit);
    if (!name || isNaN(numericLimit) || numericLimit <= 0) return { success: false, error: 'Invalid name or limit' };
    
    setLoading(true);
    try {
      const generatedIcon = await generateBudgetIcon(name);
      // addBatch now returns { success, error }
      const result = await addBatch(name, generatedIcon, numericLimit);
      
      if (result?.success) {
        setName('');
        setLimit('');
      }
      return result || { success: false, error: 'Unknown error' };
    } catch (e: any) {
      console.error('Failed to create batch with icon:', e);
      return { success: false, error: e?.message || JSON.stringify(e) || 'Failed to create batch' };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    const batch = batches.find(b => b.id === id);
    if (!batch) return;

    if (batch.ownerId === user?.id) {
      await removeBatch(id);
    } else {
      await leaveBatch(id);
    }
  };

  return {
    user,
    batches,
    name,
    setName,
    limit,
    setLimit,
    loading,
    handleCreateBatch,
    handleDeleteBatch,
    handleLogout,
    refreshData,
  };
};
