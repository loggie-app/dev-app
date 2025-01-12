import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, typography, common } from '../common/styles';

export default function CollectionCard({ collection, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { fontSize: 18, fontWeight: '600' }]}>
          {collection.name}
        </Text>
        <Text style={[typography.caption, { marginTop: 4 }]}>
          {collection.type.charAt(0).toUpperCase() + collection.type.slice(1)}
        </Text>
        
        {/* Quick stats */}
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <View style={{ 
            backgroundColor: '#2C2C2E',
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 6,
            marginRight: 8
          }}>
            <Text style={[typography.caption, { color: colors.primary }]}>
              0 Entries
            </Text>
          </View>
          <View style={{ 
            backgroundColor: '#2C2C2E',
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 6
          }}>
            <Text style={[typography.caption, { color: colors.primary }]}>
              Last updated: Today
            </Text>
          </View>
        </View>
      </View>

      <ChevronRight color={colors.text.secondary} size={20} />
    </TouchableOpacity>
  );
}