import React from 'react';
import { View, Text, TextInput } from 'react-native';
import TimeFrameSelector from './TimeFrameSelector';

const DurationConfigInput = ({ config, onUpdate }) => {
  return (
    <View>
      <Text style={{ color: '#FFF', marginVertical: 8 }}>Hours</Text>
      <TextInput
        style={{
          backgroundColor: '#2C2C2E',
          padding: 12,
          borderRadius: 8,
          color: '#FFF',
          marginBottom: 16
        }}
        value={config?.hours?.toString() || ''}
        onChangeText={(text) => onUpdate({ hours: parseInt(text, 10) || 0 })}
        placeholder="Enter hours"
        placeholderTextColor="#888"
        keyboardType="numeric"
      />

      <Text style={{ color: '#FFF', marginVertical: 8 }}>Minutes</Text>
      <TextInput
        style={{
          backgroundColor: '#2C2C2E',
          padding: 12,
          borderRadius: 8,
          color: '#FFF',
          marginBottom: 16
        }}
        value={config?.minutes?.toString() || ''}
        onChangeText={(text) => {
          const minutes = parseInt(text, 10) || 0;
          if (minutes >= 0 && minutes < 60) {
            onUpdate({ minutes });
          }
        }}
        placeholder="Enter minutes (0-59)"
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

export default DurationConfigInput;