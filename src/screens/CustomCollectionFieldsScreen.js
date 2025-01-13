import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { layout, typography, colors } from '../components/common/styles';
import { ArrowLeft, Plus } from 'lucide-react-native';
import * as fieldService from '../services/fieldService';
import FieldCard from '../components/fields/FieldCard';

export default function CustomCollectionFieldsScreen({ navigation, route }) {
  const { collectionName } = route.params || { collectionName: 'Unnamed Collection' };
  const [fields, setFields] = useState(fieldService.initializeFields());

  const handleAddField = () => {
    setFields(fieldService.addField(fields));
  };

  const handleRemoveField = (fieldId) => {
    try {
      const updatedFields = fieldService.removeField(fields, fieldId);
      setFields(updatedFields);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleUpdateField = (fieldId, updates) => {
    const updatedFields = fieldService.updateField(fields, fieldId, updates);
    setFields(updatedFields);
  };

  const handleContinue = () => {
    try {
      fieldService.validateFieldsBeforeSubmit(fields, navigation, collectionName);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={layout.safeArea}>
      <View style={{ flex: 1, padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <Text style={typography.header}>Configure Fields</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Fields List */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
          {fields.map((field, index) => (
            <FieldCard
              key={field.id}
              field={field}
              index={index}
              onUpdate={handleUpdateField}
              onRemove={handleRemoveField}
            />
          ))}

          {/* Add Field Button */}
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
            <Plus color={colors.primary} size={24} />
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 16
            }}
            onPress={handleContinue}
          >
            <Text style={[typography.body, { color: '#FFF', fontWeight: '600' }]}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}