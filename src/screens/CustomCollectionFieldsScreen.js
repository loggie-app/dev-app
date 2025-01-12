import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { layout, typography, colors, common } from '../components/common/styles';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react-native';

const DATA_TYPES = [
  { id: 'boolean', label: 'Yes/No', description: 'True/False value' },
  { id: 'number', label: 'Number', description: 'Numerical value' },
  { id: 'text', label: 'Text', description: 'Free text entry' },
  { id: 'duration', label: 'Duration', description: 'Time duration (hours & minutes)' }
];

const TIME_FRAMES = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' }
];

export default function CustomCollectionFieldsScreen({ navigation, route }) {
  const { collectionName } = route.params || { collectionName: 'Unnamed Collection' };
  const [fields, setFields] = useState([
    { id: '1', name: '', type: '', required: true, target: null, limit: null, trackingType: null }
  ]);

  const handleAddField = () => {
    setFields([
      ...fields,
      { id: Date.now().toString(), name: '', type: '', required: true, target: null, limit: null, trackingType: null }
    ]);
  };

  const handleRemoveField = (fieldId) => {
    if (fields.length === 1) {
      Alert.alert('Error', 'You need at least one field');
      return;
    }
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const updateField = (id, updates) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const handleContinue = () => {
    const emptyFields = fields.some(field => !field.name || !field.type);
    if (emptyFields) {
      Alert.alert('Error', 'Please fill in all field names and types');
      return;
    }

    const fieldNames = fields.map(f => f.name.toLowerCase());
    const hasDuplicates = new Set(fieldNames).size !== fieldNames.length;
    if (hasDuplicates) {
      Alert.alert('Error', 'Field names must be unique');
      return;
    }

    navigation.navigate('AddCollection', {
      customFields: fields,
      collectionName
    });
  };

  const renderDurationInput = (field, type) => {
    const config = type === 'target' ? field.target : field.limit;
    const updateConfig = (updates) => {
      const newConfig = { ...config, ...updates };
      updateField(field.id, { [type]: newConfig });
    };

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
          onChangeText={(text) => updateConfig({ hours: parseInt(text, 10) || 0 })}
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
              updateConfig({ minutes });
            }
          }}
          placeholder="Enter minutes (0-59)"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TIME_FRAMES.map(timeFrame => (
            <TouchableOpacity
              key={timeFrame.id}
              style={{
                backgroundColor: config?.timeFrame === timeFrame.id ? '#3A82F7' : '#2C2C2E',
                padding: 12,
                borderRadius: 8,
                marginRight: 8,
                minWidth: 100
              }}
              onPress={() => updateConfig({ timeFrame: timeFrame.id })}
            >
              <Text style={{ color: '#FFF', fontWeight: '600', textAlign: 'center' }}>{timeFrame.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, color: '#FFF' }}>Configure Fields</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
          {fields.map((field, index) => (
            <View
              key={field.id}
              style={{
                marginBottom: 12,
                padding: 16,
                backgroundColor: '#1C1C1E',
                borderRadius: 8
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <GripVertical color="#AAA" size={20} />
                <Text style={{ marginLeft: 8, color: '#FFF', fontSize: 16 }}>Field {index + 1}</Text>
                <TouchableOpacity onPress={() => handleRemoveField(field.id)} style={{ marginLeft: 'auto' }}>
                  <Trash2 color="#AAA" size={20} />
                </TouchableOpacity>
              </View>

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
                onChangeText={(text) => updateField(field.id, { name: text })}
                placeholder="Enter field name"
                placeholderTextColor="#888"
              />

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
                    onPress={() => updateField(field.id, { type: type.id })}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '600', textAlign: 'center' }}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {field.type === 'boolean' && (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ color: '#FFF', marginBottom: 8 }}>Target Configuration</Text>
                  <Text style={{ color: '#FFF', marginBottom: 8 }}>Count "Yes" Entries</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TIME_FRAMES.map(timeFrame => (
                      <TouchableOpacity
                        key={timeFrame.id}
                        style={{
                          backgroundColor: field.target?.timeFrame === timeFrame.id ? '#3A82F7' : '#2C2C2E',
                          padding: 12,
                          borderRadius: 8,
                          marginRight: 8,
                          minWidth: 100
                        }}
                        onPress={() => updateField(field.id, { target: { ...field.target, timeFrame: timeFrame.id } })}
                      >
                        <Text style={{ color: '#FFF', fontWeight: '600', textAlign: 'center' }}>{timeFrame.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

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
                    onChangeText={(text) => updateField(field.id, { target: { ...field.target, value: parseInt(text, 10) || 0 } })}
                    placeholder="Enter target value"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                  />
                </View>
              )}

              {(field.type === 'number' || field.type === 'duration') && (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ color: '#FFF', marginBottom: 8 }}>Tracking Type</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['None', 'Set Limit', 'Set Target'].map((option, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={{
                          backgroundColor: field.trackingType === option ? '#3A82F7' : '#2C2C2E',
                          padding: 12,
                          borderRadius: 8,
                          marginRight: 8,
                          minWidth: 100
                        }}
                        onPress={() => updateField(field.id, { trackingType: option, target: null, limit: null })}
                      >
                        <Text style={{ color: '#FFF', fontWeight: '600', textAlign: 'center' }}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {field.trackingType === 'Set Limit' && (
                    <View style={{ marginTop: 16 }}>
                      <Text style={{ color: '#FFF', marginBottom: 8 }}>Set Limit Value</Text>
                      {field.type === 'duration' ? (
                        renderDurationInput(field, 'limit')
                      ) : (
                        <>
                          <TextInput
                            style={{
                              backgroundColor: '#2C2C2E',
                              padding: 12,
                              borderRadius: 8,
                              color: '#FFF',
                              marginBottom: 16
                            }}
                            value={field.limit?.value?.toString() || ''}
                            onChangeText={(text) => updateField(field.id, { limit: { ...field.limit, value: parseInt(text, 10) || 0 } })}
                            placeholder="Enter limit value"
                            placeholderTextColor="#888"
                            keyboardType="numeric"
                          />
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {TIME_FRAMES.map(timeFrame => (
                              <TouchableOpacity
                                key={timeFrame.id}
                                style={{
                                  backgroundColor: field.limit?.timeFrame === timeFrame.id ? '#3A82F7' : '#2C2C2E',
                                  padding: 12,
                                  borderRadius: 8,
                                  marginRight: 8,
                                  minWidth: 100
                                }}
                                onPress={() => updateField(field.id, { limit: { ...field.limit, timeFrame: timeFrame.id } })}
                              >
                                <Text style={{ color: '#FFF', fontWeight: '600', textAlign: 'center' }}>{timeFrame.label}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </>
                      )}
                    </View>
                  )}

                  {field.trackingType === 'Set Target' && (
                    <View style={{ marginTop: 16 }}>
                      <Text style={{ color: '#FFF', marginBottom: 8 }}>Set Target Value</Text>
                      {field.type === 'duration' ? (
                        renderDurationInput(field, 'target')
                      ) : (
                        <>
                          <TextInput
                            style={{
                              backgroundColor: '#2C2C2E',
                              padding: 12,
                              borderRadius: 8,
                              color: '#FFF',
                              marginBottom: 16
                            }}
                            value={field.target?.value?.toString() || ''}
                            onChangeText={(text) => updateField(field.id, { target: { ...field.target, value: parseInt(text, 10) || 0 } })}
                            placeholder="Enter target value"
                            placeholderTextColor="#888"
                            keyboardType="numeric"
                          />
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {TIME_FRAMES.map(timeFrame => (
                              <TouchableOpacity
                                key={timeFrame.id}
                                style={{
                                  backgroundColor: field.target?.timeFrame === timeFrame.id ? '#3A82F7' : '#2C2C2E',
                                  padding: 12,
                                  borderRadius: 8,
                                  marginRight: 8,
                                  minWidth: 100
                                }}
                                onPress={() => updateField(field.id, { target: { ...field.target, timeFrame: timeFrame.id } })}
                              >
                                <Text style={{ color: '#FFF', fontWeight: '600', textAlign: 'center' }}>{timeFrame.label}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </>
                      )}
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}
                onPress={() => updateField(field.id, { required: !field.required })}
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
          ))}

          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: '#1C1C1E',
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 16
            }}
            onPress={handleAddField}
          >
            <Plus color="#3A82F7" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#3A82F7',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 16
            }}
            onPress={handleContinue}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}