import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CollectionReportCard from '../components/reports/CollectionReportCard';
import { typography, colors } from '../components/common/styles';
import * as collectionService from '../services/collectionService';

export default function ReportScreens() {
  const [collections, setCollections] = useState([]);
  const [viewType, setViewType] = useState('weekly');

  const loadCollections = async () => {
    try {
      // Load collections using the service
      const updatedCollections = await collectionService.loadCollections();
      
      // Load entries for each collection
      const collectionsWithEntries = await Promise.all(
        updatedCollections.map(async (collection) => {
          const entries = await collectionService.loadCollectionEntries(collection.id);
          return {
            ...collection,
            entries
          };
        })
      );

      setCollections(collectionsWithEntries);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={typography.header}>Reports</Text>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setViewType('weekly')}
            style={{
              backgroundColor: viewType === 'weekly' ? colors.primary : '#1C1C1E',
              padding: 10,
              borderRadius: 8,
              marginRight: 8,
            }}
          >
            <Text style={{ color: colors.text.primary, fontSize: 16 }}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewType('monthly')}
            style={{
              backgroundColor: viewType === 'monthly' ? colors.primary : '#1C1C1E',
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.text.primary, fontSize: 16 }}>Monthly</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView>
        {collections.length === 0 ? (
          <Text style={[typography.body, { textAlign: 'center', marginTop: 16 }]}>
            No collections available.
          </Text>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {collections.map((collection) => (
              <CollectionReportCard
                key={collection.id}
                collection={collection}
                viewType={viewType}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}