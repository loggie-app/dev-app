import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { typography, colors, common } from '../../components/common/styles';

const CalendarEntryList = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <View style={[common.card, { alignItems: 'center', padding: 20 }]}>
        <Text style={typography.body}>No entries for this date</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ marginTop: 16 }}>
      {entries.map((entry) => (
        <View
          key={`${entry.id}-${entry.collectionName}`}
          style={[common.card, { marginBottom: 8 }]}
        >
          <Text style={[typography.body, { fontWeight: '600' }]}>
            {entry.collectionName}
          </Text>
          {Object.entries(entry).map(([key, value]) => {
            if (key === 'id' || key === 'createdAt' || key === 'date' || key === 'collectionName') {
              return null;
            }

            // Handle duration fields
            if (key.endsWith('_hours')) {
              const baseName = key.replace('_hours', '');
              const hours = entry[key] || 0;
              const minutes = entry[`${baseName}_minutes`] || 0;
              return (
                <Text key={`${entry.id}-${baseName}`} style={typography.body}>
                  {`${baseName}: ${hours}h ${minutes}m`}
                </Text>
              );
            } else if (!key.endsWith('_minutes')) {
              return (
                <Text key={`${entry.id}-${key}`} style={typography.body}>
                  {`${key}: ${value}`}
                </Text>
              );
            }
            return null;
          })}
        </View>
      ))}
    </ScrollView>
  );
};

export default CalendarEntryList;