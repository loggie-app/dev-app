import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { TIME_FRAMES } from '../../constants/fieldTypes';

const TimeFrameSelector = ({ selectedTimeFrame, onTimeFrameSelect }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {TIME_FRAMES.map(timeFrame => (
        <TouchableOpacity
          key={timeFrame.id}
          style={{
            backgroundColor: selectedTimeFrame === timeFrame.id ? '#3A82F7' : '#2C2C2E',
            padding: 12,
            borderRadius: 8,
            marginRight: 8,
            minWidth: 100
          }}
          onPress={() => onTimeFrameSelect(timeFrame.id)}
        >
          <Text style={{ color: '#FFF', fontWeight: '600', textAlign: 'center' }}>
            {timeFrame.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default TimeFrameSelector;