import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { typography, colors } from '../../components/common/styles';

const TextField = ({ field, value, onChange }) => {
  const isDescription = field.name.toLowerCase() === 'description';

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={typography.body}>{field.name}</Text>
      <TextInput
        style={{
          backgroundColor: '#1C1C1E',
          padding: 16,
          borderRadius: 8,
          color: colors.text.primary,
          marginTop: 8,
          fontSize: 16,
          ...(isDescription && { minHeight: 100, textAlignVertical: 'top' }),
        }}
        value={value}
        onChangeText={(newValue) => onChange(field.name, newValue)}
        placeholder={`Enter ${field.name.toLowerCase()}`}
        placeholderTextColor={colors.text.secondary}
        multiline={isDescription}
      />
    </View>
  );
};

export default TextField;