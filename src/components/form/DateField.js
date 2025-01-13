import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { typography, colors } from '../../components/common/styles';
import { formatDate } from '../../utils/dateUtils';

const DateField = ({ field, value, onPress }) => {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={typography.body}>{field.name}</Text>
      <TouchableOpacity
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#1C1C1E',
          padding: 16,
          borderRadius: 8,
          marginTop: 8,
        }}
      >
        <CalendarIcon color={colors.text.primary} size={20} />
        <Text style={[typography.body, { marginLeft: 8 }]}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DateField;