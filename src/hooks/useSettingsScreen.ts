import { useState } from 'react';
import { useBudget } from '../context/useBudget';
import { supabase, generateBudgetIcon } from '@eb-packages/logic';
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

  const handleCreateBatch = async () => {
    const numericLimit = parseFloat(limit);
    if (!name || isNaN(numericLimit) || numericLimit <= 0) return;
    
    setLoading(true);
    try {
      const generatedIcon = await generateBudgetIcon(name);
      await addBatch(name, generatedIcon, numericLimit);
      setName('');
      setLimit('');
    } catch (e) {
      console.error('Failed to create batch with icon:', e);
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
