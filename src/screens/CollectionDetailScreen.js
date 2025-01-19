// src/screens/CollectionDetailScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { layout, typography, colors, common } from '../components/common/styles';
import { Plus, Calendar } from 'lucide-react-native';
import * as collectionService from '../services/collectionService';
import { formatDate } from '../utils/dateUtils';
import StatsCard from '../components/collection/StatsCard';
import EntryCard from '../components/collection/EntryCard';
import EmptyState from '../components/common/EmptyState';

export default function CollectionDetailScreen({ route, navigation }) {
  const { collection } = route.params;
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);

  const loadCollectionData = async () => {
    try {
      const collectionData = await collectionService.getCollectionStats(collection);
      // Sort entries by date in descending order and add unique key
      const sortedEntries = collectionData.entries
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((entry, index) => ({
          ...entry,
          uniqueKey: `${entry.id}-${index}` // Add unique key combining id and index
        }));
      setEntries(sortedEntries);
      setStats(collectionData);
    } catch (error) {
      console.error('Error loading collection data:', error);
      Alert.alert('Error', 'Failed to load collection data');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCollectionData);
    loadCollectionData();
    return unsubscribe;
  }, [navigation, collection.id]);

  const handleAddEntry = () => {
    navigation.navigate('AddEntry', { collection });
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const updatedEntries = await collectionService.deleteEntry(collection.id, entryId);
      loadCollectionData(); // Reload all data after deletion
    } catch (error) {
      console.error('Error deleting entry:', error);
      Alert.alert('Error', 'Failed to delete the entry. Please try again.');
    }
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete the collection "${collection.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await collectionService.deleteCollection(collection.id);
              Alert.alert('Success', `Collection "${collection.name}" has been deleted.`);
              navigation.navigate('HomeScreen');
            } catch (error) {
              console.error('Error deleting collection:', error);
              Alert.alert('Error', 'Failed to delete the collection. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={layout.safeArea}>
      <ScrollView style={layout.screen}>
        {/* Stats Section */}
        {stats && (
          <StatsCard
            targetStats={stats.targetStats}
            entriesCount={stats.entriesCount}
            lastEntryDate={stats.lastUpdated}
          />
        )}

        {/* Recent Entries Section */}
        <View style={common.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[typography.body, { fontSize: 18, fontWeight: '600' }]}>Recent Entries</Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={handleAddEntry}
            >
              <Plus color="#FFF" size={18} />
              <Text style={[typography.body, { color: '#FFF', marginLeft: 4, fontWeight: '600' }]}>
                Add Entry
              </Text>
            </TouchableOpacity>
          </View>

          {entries.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No entries yet"
              description="Tap the Add Entry button above to get started"
            />
          ) : (
            entries.map((entry) => (
              <EntryCard
                key={entry.uniqueKey} // Use the unique key here
                entry={entry}
                onDelete={handleDeleteEntry}
              />
            ))
          )}
        </View>

        {/* Collection Info */}
        <View style={[common.card, { marginTop: 16 }]}>
          <Text style={[typography.body, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>Collection Info</Text>

          <View style={{ marginBottom: 12 }}>
            <Text style={typography.caption}>Created On</Text>
            <Text style={typography.body}>{formatDate(collection.createdAt)}</Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={typography.caption}>Type</Text>
            <Text style={typography.body}>{collection.type}</Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#ff3b30',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 8,
            }}
            onPress={handleDeleteCollection}
          >
            <Text style={[typography.body, { color: '#FFF', fontWeight: '600' }]}>Delete Collection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}