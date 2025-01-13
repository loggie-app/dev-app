import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { layout, typography, colors, common } from '../components/common/styles';
import { ArrowLeft } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as formService from '../services/formService';
import { validateFormData } from '../utils/validationUtils';

// Import form field components
import BooleanField from '../components/form/BooleanField';
import DateField from '../components/form/DateField';
import NumberField from '../components/form/NumberField';
import DurationField from '../components/form/DurationField';
import TextField from '../components/form/TextField';

export default function AddEntryScreen({ route, navigation }) {
  const { collection } = route.params;
  const [formData, setFormData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState(null);
  const [existingEntries, setExistingEntries] = useState([]);

  useEffect(() => {
    const initializeForm = async () => {
      const initialData = formService.initializeFormData(collection);
      setFormData(initialData);
      const entries = await formService.loadExistingEntries(collection.id);
      setExistingEntries(entries);
    };

    initializeForm();
  }, [collection]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => formService.updateFormField(prev, fieldName, value));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleFieldChange(dateField, selectedDate.toISOString());
    }
  };

  const handleDateFieldPress = (fieldName) => {
    setDateField(fieldName);
    setShowDatePicker(true);
  };

  const handleSave = async () => {
    const { errors, warnings } = validateFormData(formData, collection, existingEntries);
    
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    if (warnings.length > 0) {
      Alert.alert('Achievement', warnings.join('\n'));
    }

    try {
      await formService.saveFormEntry(collection.id, formData, existingEntries);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'boolean':
        return (
          <BooleanField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={handleFieldChange}
          />
        );

      case 'date':
        return (
          <DateField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onPress={() => handleDateFieldPress(field.name)}
          />
        );

      case 'number':
        return (
          <NumberField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={handleFieldChange}
          />
        );

      case 'duration':
        return (
          <DurationField
            key={field.name}
            field={field}
            values={{
              hours: formData[`${field.name}_hours`],
              minutes: formData[`${field.name}_minutes`]
            }}
            onChange={handleFieldChange}
          />
        );

      default: // text
        return (
          <TextField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={handleFieldChange}
          />
        );
    }
  };

  return (
    <SafeAreaView style={layout.safeArea}>
      <ScrollView style={layout.screen}>
        {/* Header */}
        <View style={[common.row, { justifyContent: 'space-between', marginBottom: 20 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <Text style={typography.header}>New Entry</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Form */}
        <View style={common.card}>
          {/* Default Date Field */}
          <DateField
            field={{ name: 'Date' }}
            value={formData.date}
            onPress={() => handleDateFieldPress('date')}
          />

          {/* Custom Fields */}
          {collection.customFields?.map((field) => renderField(field))}

          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData[dateField])}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 16,
            }}
            onPress={handleSave}
          >
            <Text style={[typography.body, { color: '#FFF', fontWeight: '600' }]}>
              Save Entry
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}