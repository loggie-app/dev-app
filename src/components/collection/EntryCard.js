import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { typography, colors } from '../../components/common/styles';
import { formatDate } from '../../utils/dateUtils';

const EntryCard = ({ entry, onDelete }) => {
  const renderField = (key) => {
    if (key === 'id' || key === 'createdAt' || key === 'date') {
      return null;
    }

    // Handle duration fields (checking for _hours suffix)
    if (key.endsWith('_hours')) {
      const baseName = key.replace('_hours', '');
      const hours = entry[key] || 0;
      const minutes = entry[`${baseName}_minutes`] || 0;
      return (
        <Text key={baseName} style={[typography.body, { fontSize: 16 }]}>
          {`${baseName}: ${hours}h ${minutes}m`}
        </Text>
      );
    } 
    
    // Skip _minutes fields as they're handled with _hours
    if (key.endsWith('_minutes')) {
      return null;
    }

    // Handle all other fields
    return (
      <Text key={key} style={[typography.body, { fontSize: 16 }]}>
        {`${key}: ${entry[key]}`}
      </Text>
    );
  };

  return (
    <View
      style={{
        backgroundColor: '#1C1C1E',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View>
        {Object.keys(entry).map(renderField)}
        <Text style={[typography.caption, { color: colors.text.secondary }]}>
          {entry.description || 'No description'}
        </Text>
        <Text style={[typography.caption, { marginTop: 8, color: colors.text.secondary }]}>
          {formatDate(entry.date)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(entry.id)}>
        <Trash2 color={colors.text.secondary} size={20} />
      </TouchableOpacity>
    </View>
  );
};

export default EntryCard;