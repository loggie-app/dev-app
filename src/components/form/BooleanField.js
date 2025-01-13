import React from 'react';
import { View, Text, Switch } from 'react-native';
import { typography, colors } from '../../components/common/styles';

const BooleanField = ({ field, value, onChange }) => {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={typography.body}>{field.name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <Switch
          value={value}
          onValueChange={(newValue) => onChange(field.name, newValue)}
          trackColor={{ false: '#1C1C1E', true: colors.primary }}
        />
        <Text style={[typography.body, { marginLeft: 8 }]}>
          {value ? 'Yes' : 'No'}
        </Text>
      </View>
    </View>
  );
};

export default BooleanField;