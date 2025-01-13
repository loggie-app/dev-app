import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TRACKING_TYPES } from '../../constants/fieldTypes';

const TrackingTypeSelector = ({ selectedType, onTypeSelect }) => {
  return (
    <View>
      <Text style={{ color: '#FFF', marginBottom: 8 }}>Tracking Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {TRACKING_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={{
              backgroundColor: selectedType === type.label ? '#3A82F7' : '#2C2C2E',
              padding: 12,
              borderRadius: 8,
              marginRight: 8,
              minWidth: 100
            }}
            onPress={() => onTypeSelect(type.label)}
          >
            <Text style={{ color: '#FFF', fontWeight: '600', textAlign: 'center' }}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default TrackingTypeSelector;