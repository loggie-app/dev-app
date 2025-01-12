import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Switch } from 'react-native';
import { layout, typography, colors, common } from '../components/common/styles';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddEntryScreen({ route, navigation }) {
  const { collection } = route.params;
  const [formData, setFormData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState(null);
  const [existingEntries, setExistingEntries] = useState([]);

useEffect(() => {
  const initialData = {
    id: '',
    date: new Date().toISOString(),
  };
  if (collection.customFields) {
    collection.customFields.forEach((field) => {
      if (field.type === 'boolean') {
        initialData[field.name] = false;
      } else if (field.type === 'number') {
        initialData[field.name] = '';
      } else if (field.type === 'duration') {  // Add this block
        initialData[`${field.name}_hours`] = '';
        initialData[`${field.name}_minutes`] = '';
      } else {
        initialData[field.name] = '';
      }
    });
  }
  setFormData(initialData);
  loadExistingEntries();
}, [collection]);

  const loadExistingEntries = async () => {
    try {
      const entriesKey = `entries_${collection.id}`;
      const existingEntriesJSON = await AsyncStorage.getItem(entriesKey);
      const entries = existingEntriesJSON ? JSON.parse(existingEntriesJSON) : [];
      setExistingEntries(entries);
    } catch (error) {
      console.error('Error loading existing entries:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '/');
  };

  const convertDurationToMinutes = (hours, minutes) => {
  return (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);
};



const checkDurationLimitsAndTargets = (field, hours, minutes) => {
  const totalMinutes = convertDurationToMinutes(hours, minutes);
  if (totalMinutes === 0) return null;

  if (field.trackingType === 'Set Limit' && field.limit) {
    const { timeFrame, hours: limitHours = 0, minutes: limitMinutes = 0 } = field.limit;
    const limitTotalMinutes = convertDurationToMinutes(limitHours, limitMinutes);
    const currentDate = new Date();
    
    // Filter entries based on time frame
    const relevantEntries = existingEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      if (timeFrame === 'day') {
        return entryDate.toDateString() === currentDate.toDateString();
      } else if (timeFrame === 'week') {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        return entryDate >= weekStart;
      } else if (timeFrame === 'month') {
        return (
          entryDate.getMonth() === currentDate.getMonth() &&
          entryDate.getFullYear() === currentDate.getFullYear()
        );
      }
      return false;
    });

    // Calculate total including current value
    const total = relevantEntries.reduce((sum, entry) => {
      const entryMinutes = convertDurationToMinutes(
        entry[`${field.name}_hours`] || 0,
        entry[`${field.name}_minutes`] || 0
      );
      return sum + entryMinutes;
    }, totalMinutes);

    if (total > limitTotalMinutes) {
      const totalHours = Math.floor(total / 60);
      const totalMins = total % 60;
      const limitHrs = Math.floor(limitTotalMinutes / 60);
      const limitMins = limitTotalMinutes % 60;
      return {
        type: 'limit',
        message: `This entry would exceed your ${timeFrame}ly limit of ${limitHrs}h ${limitMins}m for ${field.name}. Current total would be ${totalHours}h ${totalMins}m.`
      };
    }
  }

  if (field.trackingType === 'Set Target' && field.target) {
    const { timeFrame, hours: targetHours = 0, minutes: targetMinutes = 0 } = field.target;
    const targetTotalMinutes = convertDurationToMinutes(targetHours, targetMinutes);
    const currentDate = new Date();
    
    // Filter entries based on time frame
    const relevantEntries = existingEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      if (timeFrame === 'day') {
        return entryDate.toDateString() === currentDate.toDateString();
      } else if (timeFrame === 'week') {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        return entryDate >= weekStart;
      } else if (timeFrame === 'month') {
        return (
          entryDate.getMonth() === currentDate.getMonth() &&
          entryDate.getFullYear() === currentDate.getFullYear()
        );
      }
      return false;
    });

    // Calculate total including current value
    const total = relevantEntries.reduce((sum, entry) => {
      const entryMinutes = convertDurationToMinutes(
        entry[`${field.name}_hours`] || 0,
        entry[`${field.name}_minutes`] || 0
      );
      return sum + entryMinutes;
    }, totalMinutes);

    if (total >= targetTotalMinutes && relevantEntries.length === 0) {
      const totalHours = Math.floor(total / 60);
      const totalMins = total % 60;
      const targetHrs = Math.floor(targetTotalMinutes / 60);
      const targetMins = targetTotalMinutes % 60;
      return {
        type: 'target',
        message: `Congratulations! You've reached your ${timeFrame}ly target of ${targetHrs}h ${targetMins}m for ${field.name}!`
      };
    }
  }

  return null;
};


  const checkNumberFieldLimitsAndTargets = (field, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    if (field.trackingType === 'Set Limit' && field.limit) {
      const { timeFrame, value: limitValue } = field.limit;
      const currentDate = new Date();
      
      // Filter entries based on time frame
      const relevantEntries = existingEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        if (timeFrame === 'day') {
          return entryDate.toDateString() === currentDate.toDateString();
        } else if (timeFrame === 'week') {
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          return entryDate >= weekStart;
        } else if (timeFrame === 'month') {
          return (
            entryDate.getMonth() === currentDate.getMonth() &&
            entryDate.getFullYear() === currentDate.getFullYear()
          );
        }
        return false;
      });

      // Calculate total including current value
      const total = relevantEntries.reduce((sum, entry) => {
        return sum + (parseFloat(entry[field.name]) || 0);
      }, numValue);

      if (total > limitValue) {
        return {
          type: 'limit',
          message: `This entry would exceed your ${timeFrame}ly limit of ${limitValue} for ${field.name}. Current total would be ${total}.`
        };
      }
    }

    if (field.trackingType === 'Set Target' && field.target) {
      const { timeFrame, value: targetValue } = field.target;
      const currentDate = new Date();
      
      // Filter entries based on time frame
      const relevantEntries = existingEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        if (timeFrame === 'day') {
          return entryDate.toDateString() === currentDate.toDateString();
        } else if (timeFrame === 'week') {
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          return entryDate >= weekStart;
        } else if (timeFrame === 'month') {
          return (
            entryDate.getMonth() === currentDate.getMonth() &&
            entryDate.getFullYear() === currentDate.getFullYear()
          );
        }
        return false;
      });

      // Calculate total including current value
      const total = relevantEntries.reduce((sum, entry) => {
        return sum + (parseFloat(entry[field.name]) || 0);
      }, numValue);

      if (total >= targetValue && relevantEntries.length === 0) {
        return {
          type: 'target',
          message: `Congratulations! You've reached your ${timeFrame}ly target of ${targetValue} for ${field.name}!`
        };
      }
    }

    return null;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        [dateField]: selectedDate.toISOString(),
      }));
    }
  };

  const validateFormData = () => {
  const errors = [];
  const warnings = [];
  
  collection.customFields?.forEach((field) => {
    if (field.required) {
      if (field.type === 'duration') {
        const hours = formData[`${field.name}_hours`];
        const minutes = formData[`${field.name}_minutes`];
        if (!hours && !minutes) {
          errors.push(`${field.name} is required`);
        }
      } else if (!formData[field.name] && formData[field.name] !== false) {
        errors.push(`${field.name} is required`);
      }
    }
    
    if (field.type === 'duration') {
      const hours = formData[`${field.name}_hours`];
      const minutes = formData[`${field.name}_minutes`];
      if ((hours && isNaN(hours)) || (minutes && isNaN(minutes))) {
        errors.push(`${field.name} must contain valid numbers`);
      } else if (hours || minutes) {
        const limitCheck = checkDurationLimitsAndTargets(field, hours, minutes);
        if (limitCheck) {
          if (limitCheck.type === 'limit') {
            errors.push(limitCheck.message);
          } else if (limitCheck.type === 'target') {
            warnings.push(limitCheck.message);
          }
        }
      }
    }
    });

    return { errors, warnings };
  };

  const handleSave = async () => {
    const { errors, warnings } = validateFormData();
    
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    if (warnings.length > 0) {
      Alert.alert('Achievement', warnings.join('\n'));
    }

    try {
      const entriesKey = `entries_${collection.id}`;
      const newEntry = {
        ...formData,
        id: (existingEntries.length + 1).toString(),
        createdAt: new Date().toISOString(),
      };

      const updatedEntries = [...existingEntries, newEntry];
      await AsyncStorage.setItem(entriesKey, JSON.stringify(updatedEntries));
      
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
          <View key={field.name} style={{ marginBottom: 16 }}>
            <Text style={typography.body}>{field.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Switch
                value={formData[field.name]}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, [field.name]: value }))}
                trackColor={{ false: '#1C1C1E', true: colors.primary }}
              />
              <Text style={[typography.body, { marginLeft: 8 }]}>
                {formData[field.name] ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
        );

      case 'date':
        return (
          <View key={field.name} style={{ marginBottom: 16 }}>
            <Text style={typography.body}>{field.name}</Text>
            <TouchableOpacity
              onPress={() => {
                setDateField(field.name);
                setShowDatePicker(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1C1E',
                padding: 16,
                borderRadius: 8,
                marginTop: 8,
              }}
            >
              <CalendarIcon color={colors.text.primary} size={20} />
              <Text style={[typography.body, { marginLeft: 8 }]}>
                {formatDate(formData[field.name])}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'number':
        return (
          <View key={field.name} style={{ marginBottom: 16 }}>
            <Text style={typography.body}>{field.name}</Text>
            <TextInput
              style={{
                backgroundColor: '#1C1C1E',
                padding: 16,
                borderRadius: 8,
                color: colors.text.primary,
                marginTop: 8,
                fontSize: 16,
              }}
              value={formData[field.name]}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, [field.name]: value }))}
              placeholder={`Enter ${field.name.toLowerCase()}`}
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
            />
          </View>
        );

case 'duration':
  return (
    <View key={field.name} style={{ marginBottom: 16 }}>
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
            value={formData[`${field.name}_hours`]}
            onChangeText={(value) => {
              const hours = parseInt(value, 10);
              if (!value || !isNaN(hours)) {
                setFormData((prev) => ({ ...prev, [`${field.name}_hours`]: value }));
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
            value={formData[`${field.name}_minutes`]}
            onChangeText={(value) => {
              const minutes = parseInt(value, 10);
              if (!value || (!isNaN(minutes) && minutes >= 0 && minutes < 60)) {
                setFormData((prev) => ({ ...prev, [`${field.name}_minutes`]: value }));
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

      default: // text
        return (
          <View key={field.name} style={{ marginBottom: 16 }}>
            <Text style={typography.body}>{field.name}</Text>
            <TextInput
              style={{
                backgroundColor: '#1C1C1E',
                padding: 16,
                borderRadius: 8,
                color: colors.text.primary,
                marginTop: 8,
                fontSize: 16,
                ...(field.name === 'description' && { minHeight: 100, textAlignVertical: 'top' }),
              }}
              value={formData[field.name]}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, [field.name]: value }))}
              placeholder={`Enter ${field.name.toLowerCase()}`}
              placeholderTextColor={colors.text.secondary}
              multiline={field.name === 'description'}
            />
          </View>
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
          <View style={{ marginBottom: 16 }}>
            <Text style={typography.body}>Date</Text>
            <TouchableOpacity
              onPress={() => {
                setDateField('date');
                setShowDatePicker(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1C1E',
                padding: 16,
                borderRadius: 8,
                marginTop: 8,
              }}
            >
              <CalendarIcon color={colors.text.primary} size={20} />
              <Text style={[typography.body, { marginLeft: 8 }]}>
                {formatDate(formData.date)}
              </Text>
            </TouchableOpacity>
          </View>

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