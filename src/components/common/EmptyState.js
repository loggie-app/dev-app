import React from 'react';
import { View, Text } from 'react-native';
import { typography, colors } from './styles';

const EmptyState = ({ 
  icon: Icon,  // Lucide icon component
  title, 
  description,
  size = 48,
  color = colors.text.secondary 
}) => {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
      {Icon && <Icon color={color} size={size} />}
      <Text style={[typography.body, { marginTop: 16, color: colors.text.secondary }]}>
        {title}
      </Text>
      {description && (
        <Text style={[typography.caption, { marginTop: 8, textAlign: 'center' }]}>
          {description}
        </Text>
      )}
    </View>
  );
};

export default EmptyState;