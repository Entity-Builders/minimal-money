import { useState } from 'react';
import { useBudget } from '../context/useBudget';
import { supabase } from '@eb-packages/logic';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

export const useSettingsScreen = () => {
  const { user, batches, addBatch, removeBatch, resetData } = useBudget();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📌');
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
    await addBatch(name, icon, numericLimit);
    setName('');
    setIcon('📌');
    setLimit('');
    setLoading(false);
  };

  const handleDeleteBatch = async (id: string) => {
    await removeBatch(id);
  };

  return {
    user,
    batches,
    name,
    setName,
    icon,
    setIcon,
    limit,
    setLimit,
    loading,
    handleCreateBatch,
    handleDeleteBatch,
    handleLogout,
  };
};
