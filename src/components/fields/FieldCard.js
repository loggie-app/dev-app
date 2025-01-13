import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { GripVertical, Trash2 } from 'lucide-react-native';
import { DATA_TYPES } from '../../constants/fieldTypes';
import TrackingTypeSelector from './TrackingTypeSelector';
import TargetValueInput from './TargetValueInput';
import TimeFrameSelector from './TimeFrameSelector';

const FieldCard = ({ 
  field, 
  index, 
  onUpdate, 
  onRemove 
}) => {
  const updateConfig = (type, updates) => {
    const newConfig = { ...field[type], ...updates };
    onUpdate(field.id, { [type]: newConfig });
  };

  return (
    <View
      style={{
        marginBottom: 12,
        padding: 16,
        backgroundColor: '#1C1C1E',
        borderRadius: 8
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <GripVertical color="#AAA" size={20} />
        <Text style={{ marginLeft: 8, color: '#FFF', fontSize: 16 }}>Field {index + 1}</Text>
        <TouchableOpacity onPress={() => onRemove(field.id)} style={{ marginLeft: 'auto' }}>
          <Trash2 color="#AAA" size={20} />
        </TouchableOpacity>
      </View>

      {/* Field Name Input */}
      <Text style={{ color: '#FFF', marginBottom: 8 }}>Field Name</Text>
      <TextInput
        style={{
          backgroundColor: '#2C2C2E',
          padding: 12,
          borderRadius: 8,
          color: '#FFF',
          marginBottom: 16
        }}
        value={field.name}
        onChangeText={(text) => onUpdate(field.id, { name: text })}
        placeholder="Enter field name"
        placeholderTextColor="#888"
      />

      {/* Field Type Selection */}
      <Text style={{ color: '#FFF', marginBottom: 8 }}>Field Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {DATA_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={{
              backgroundColor: field.type === type.id ? '#3A82F7' : '#2C2C2E',
              padding: 12,
              borderRadius: 8,
              marginRight: 8,
              minWidth: 100
            }}
            onPress={() => onUpdate(field.id, { type: type.id })}
          >
            <Text style={{ color: '#FFF', fontWeight: '600', textAlign: 'center' }}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Boolean Field Target Config */}
      {field.type === 'boolean' && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: '#FFF', marginBottom: 8 }}>Target Configuration</Text>
          <Text style={{ color: '#FFF', marginBottom: 8 }}>Count "Yes" Entries</Text>
          <TimeFrameSelector
            selectedTimeFrame={field.target?.timeFrame}
            onTimeFrameSelect={(timeFrame) => 
              updateConfig('target', { timeFrame })}
          />
          <Text style={{ color: '#FFF', marginVertical: 8 }}>Target Value</Text>
          <TextInput
            style={{
              backgroundColor: '#2C2C2E',
              padding: 12,
              borderRadius: 8,
              color: '#FFF',
              marginBottom: 16
            }}
            value={field.target?.value?.toString() || ''}
            onChangeText={(text) => 
              updateConfig('target', { value: parseInt(text, 10) || 0 })}
            placeholder="Enter target value"
            placeholderTextColor="#888"
            keyboardType="numeric"
          />
        </View>
      )}

      {/* Number/Duration Field Config */}
      {(field.type === 'number' || field.type === 'duration') && (
        <View style={{ marginTop: 16 }}>
          <TrackingTypeSelector
            selectedType={field.trackingType}
            onTypeSelect={(trackingType) => 
              onUpdate(field.id, { trackingType, target: null, limit: null })}
          />

          {field.trackingType === 'Set Limit' && (
            <TargetValueInput
              type={field.type}
              config={field.limit}
              onUpdate={(updates) => updateConfig('limit', updates)}
              isLimit
            />
          )}

          {field.trackingType === 'Set Target' && (
            <TargetValueInput
              type={field.type}
              config={field.target}
              onUpdate={(updates) => updateConfig('target', updates)}
            />
          )}
        </View>
      )}

      {/* Required Field Toggle */}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}
        onPress={() => onUpdate(field.id, { required: !field.required })}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            backgroundColor: field.required ? '#3A82F7' : '#2C2C2E',
            marginRight: 8
          }}
        />
        <Text style={{ color: '#FFF' }}>Required Field</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FieldCard;