import { ScrollView, View, Text, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReportScreens() {
  const [collections, setCollections] = useState([]);

  const loadCollections = async () => {
    try {
      const storedCollectionsJSON = await AsyncStorage.getItem('collections');
      const storedCollections = storedCollectionsJSON
        ? JSON.parse(storedCollectionsJSON)
        : [];

      const updatedCollections = await Promise.all(
        storedCollections.map(async (collection) => {
          const entriesKey = `entries_${collection.id}`;
          const entriesJSON = await AsyncStorage.getItem(entriesKey);
          const entries = entriesJSON ? JSON.parse(entriesJSON) : [];

          const lastUpdated = entries.reduce((latest, entry) => {
            const entryDate = new Date(entry.date);
            return entryDate > new Date(latest) ? entry.date : latest;
          }, null);

          return {
            ...collection,
            entriesCount: entries.length,
            lastUpdated,
          };
        })
      );

      setCollections(updatedCollections);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' }}>
          Reports
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {collections.length === 0 ? (
          <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
            No collections available.
          </Text>
        ) : (
          collections.map((collection) => (
            <View
              key={collection.id}
              style={{
                backgroundColor: '#1C1C1E',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                {collection.name}
              </Text>
              <Text
                style={{ color: '#A9A9A9', fontSize: 14, marginBottom: 8 }}
              >
                Type: {collection.type || 'Custom'}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '500' }}
                >
                  Total Entries:
                </Text>
                <Text
                  style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '500' }}
                >
                  {collection.entriesCount || 0}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '500' }}
                >
                  Last Updated:
                </Text>
                <Text
                  style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '500' }}
                >
                  {formatDate(collection.lastUpdated)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
