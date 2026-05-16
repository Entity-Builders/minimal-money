import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';

export interface Member {
  id: string;
  email?: string;
  role?: string;
}

interface SharedAvatarsProps {
  members: Member[];
  onPress?: () => void;
  size?: number;
  maxDisplay?: number;
  containerStyle?: StyleProp<ViewStyle>;
  borderColor?: string;
}

export const SharedAvatars: React.FC<SharedAvatarsProps> = ({
  members,
  onPress,
  size = 20,
  maxDisplay = 3,
  containerStyle,
  borderColor = '#000',
}) => {
  if (!members || members.length <= 1) return null;

  const displayMembers = members.slice(0, maxDisplay);
  const extraCount = members.length - maxDisplay;

  const Content = (
    <View style={[{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, gap: -(size * 0.4) }, containerStyle]}>
      {displayMembers.map((member, idx) => (
        <View
          key={member.id}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#30D158',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: borderColor,
            zIndex: 10 - idx,
          }}
        >
          <Text style={{ fontSize: size * 0.45, fontWeight: 'bold', color: '#FFF' }}>
            {member.email?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
      ))}
      {extraCount > 0 && (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: borderColor,
            zIndex: 0,
          }}
        >
          <Text style={{ fontSize: size * 0.4, fontWeight: 'bold', color: '#FFF' }}>
            +{extraCount}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
};
