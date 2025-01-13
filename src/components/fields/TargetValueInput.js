import React from 'react';
import { View, Text, TextInput } from 'react-native';
import TimeFrameSelector from './TimeFrameSelector';
import DurationConfigInput from './DurationConfigInput';

const TargetValueInput = ({ 
  type, 
  config, 
  onUpdate, 
  isLimit = false 
}) => {
  const label = isLimit ? 'Limit' : 'Target';

  if (type === 'duration') {
    return (
      <View style={{ marginTop: 16 }}>
        <Text style={{ color: '#FFF', marginBottom: 8 }}>Set {label} Value</Text>
        <DurationConfigInput
          config={config}
          onUpdate={onUpdate}
        />
      </View>
    );
  }

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ color: '#FFF', marginBottom: 8 }}>Set {label} Value</Text>
      <TextInput
        style={{
          backgroundColor: '#2C2C2E',
          padding: 12,
          borderRadius: 8,
          color: '#FFF',
          marginBottom: 16
        }}
        value={config?.value?.toString() || ''}
        onChangeText={(text) => onUpdate({ value: parseInt(text, 10) || 0 })}
        placeholder={`Enter ${label.toLowerCase()} value`}
        placeholderTextColor="#888"
        keyboardType="numeric"
      />
      <TimeFrameSelector
        selectedTimeFrame={config?.timeFrame}
        onTimeFrameSelect={(timeFrame) => onUpdate({ timeFrame })}
      />
    </View>
  );
};

export default TargetValueInput;