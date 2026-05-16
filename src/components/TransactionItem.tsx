import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Transaction } from '../types';
import { useBudget } from '../context/useBudget';
import { Ionicons } from '@expo/vector-icons';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
}) => {
  const { user, activeBatch } = useBudget();
  const isOwnerOfTransaction = user?.id === transaction.userId;
  const isShared = (activeBatch?.sharedWith?.length ?? 1) > 1;
  const authorMember = activeBatch?.sharedWith?.find(m => m.id === transaction.userId);
  const authorName = isOwnerOfTransaction ? 'Yo' : (authorMember?.email?.split('@')[0] || 'Otro');

  // All transactions in Minimal Money are expenses — amounts are always positive.
  const timeAgo = formatDistanceToNow(new Date(transaction.timestamp), {
    addSuffix: true,
    locale: es,
  });

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {transaction.name || 'General'}
        </Text>
        <Text style={styles.timeText}>hace {timeAgo}</Text>
      </View>
      <View style={styles.rightColumn}>
        <Text
          style={[
            styles.amountText,
            { color: '#FF453A' },
          ]}
        >
          - $ {Math.abs(transaction.amount).toFixed(2)}
        </Text>
        {isShared && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
            <Ionicons 
              name={isOwnerOfTransaction ? "person-circle" : "person-circle-outline"} 
              size={14} 
              color={isOwnerOfTransaction ? "#30D158" : "#888"} 
            />
            <Text style={{ fontSize: 10, color: isOwnerOfTransaction ? '#30D158' : '#888' }} numberOfLines={1}>
              {authorName}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)', // Divider color
    marginHorizontal: 16, // Add some margin to align with header
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80, // Ensure amount aligns vertically even if small
  },
  nameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeText: {
    color: '#666',
    fontSize: 14,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
