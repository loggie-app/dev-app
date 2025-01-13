import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { typography, colors } from '../../components/common/styles';

const DurationField = ({ field, values, onChange }) => {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={typography.body}>{field.name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>Hours</Text>
          <TextInput
            style={{
              backgroundColor: '#1C1C1E',
              padding: 16,
              borderRadius: 8,
              color: colors.text.primary,
              marginTop: 4,
              fontSize: 16,
            }}
            value={values.hours}
            onChangeText={(value) => {
              const hours = parseInt(value, 10);
              if (!value || !isNaN(hours)) {
                onChange(`${field.name}_hours`, value);
              }
            }}
            placeholder="0"
            placeholderTextColor={colors.text.secondary}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>Minutes</Text>
          <TextInput
            style={{
              backgroundColor: '#1C1C1E',
              padding: 16,
              borderRadius: 8,
              color: colors.text.primary,
              marginTop: 4,
              fontSize: 16,
            }}
            value={values.minutes}
            onChangeText={(value) => {
              const minutes = parseInt(value, 10);
              if (!value || (!isNaN(minutes) && minutes >= 0 && minutes < 60)) {
                onChange(`${field.name}_minutes`, value);
              }
            }}
            placeholder="0"
            placeholderTextColor={colors.text.secondary}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );
};

export default DurationField;