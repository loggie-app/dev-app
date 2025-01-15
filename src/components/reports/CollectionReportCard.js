import React from 'react';
import { View, Text } from 'react-native';
import { typography } from '../common/styles';
import CollectionTargetGraphs from './CollectionTargetGraphs';

const CollectionReportCard = ({ collection, viewType }) => {
  const hasTargetsOrLimits = collection.customFields?.some(
    field => (field.target || field.limit) && 
            ['boolean', 'number', 'duration'].includes(field.type)
  );

  if (!hasTargetsOrLimits) {
    return null;
  }

  return (
    <View style={{
      backgroundColor: '#1C1C1E',
      borderRadius: 12,
      marginBottom: 16,
    }}>
      <Text style={[typography.body, { fontSize: 20, fontWeight: '600', padding: 16 }]}>
        {collection.name}
      </Text>
      <Text style={[typography.caption, { paddingHorizontal: 16 }]}>
        {collection.type || 'Custom Collection'}
      </Text>
      <CollectionTargetGraphs 
        fields={collection.customFields}
        entries={collection.entries}
        viewType={viewType}
      />
    </View>
  );
};

export default CollectionReportCard;