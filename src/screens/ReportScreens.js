import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import CollectionReportCard from '../components/reports/CollectionReportCard';
import { typography, colors } from '../components/common/styles';
import * as collectionService from '../services/collectionService';
import { useFocusEffect } from '@react-navigation/native';

export default function ReportScreens() {
  const [collections, setCollections] = useState([]);
  const [viewType, setViewType] = useState('weekly');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

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

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCollections();
      
      // Set up an interval to refresh data periodically
      const intervalId = setInterval(() => {
        setLastUpdate(Date.now());
        loadCollections();
      }, 3000); // Refresh every 3 seconds while screen is focused

      return () => {
        // Clean up interval on screen unfocus
        clearInterval(intervalId);
      };
    }, [])
  );

  // Handle manual refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
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
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {collections.length === 0 ? (
          <Text style={[typography.body, { textAlign: 'center', marginTop: 16 }]}>
            No collections available.
          </Text>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {collections.map((collection) => (
              <CollectionReportCard
                key={`${collection.id}-${lastUpdate}`}
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