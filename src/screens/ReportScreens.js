import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

export default function ReportScreens() {
  const [collections, setCollections] = useState([]);
  const [viewType, setViewType] = useState('weekly'); // 'weekly' or 'monthly'

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

          return {
            ...collection,
            entries,
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

  const formatDataForChart = (entries) => {
    const groupedData = entries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const key =
        viewType === 'weekly'
          ? `Week ${Math.ceil(date.getDate() / 7)}`
          : `${date.getMonth() + 1}-${date.getFullYear()}`;

      acc[key] = (acc[key] || 0) + entry.value; // Assume entries have 'value'
      return acc;
    }, {});

    const labels = Object.keys(groupedData);
    const data = labels.map((label) => groupedData[label]);

    const cleanData = data.map((value) => (isNaN(value) ? 0 : value));

    return { labels, data: cleanData };
  };

  const renderLineChart = (entries) => {
    const { labels, data } = formatDataForChart(entries);

    if (!data || data.length === 0) {
      return (
        <Text style={{ color: '#FFFFFF', textAlign: 'center', marginTop: 8 }}>
          No data available for the selected view.
        </Text>
      );
    }

    return (
      <LineChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={Dimensions.get('window').width - 90} // Adjusted chart width
        height={200} // Chart height
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#1C1C1E',
          backgroundGradientFrom: '#1C1C1E',
          backgroundGradientTo: '#1C1C1E',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: '6', strokeWidth: '2', stroke: '#FFA726' },
        }}
        bezier
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' }}>
          Reports
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setViewType('weekly')}
            style={{
              backgroundColor: viewType === 'weekly' ? '#1E90FF' : '#1C1C1E',
              padding: 10,
              borderRadius: 8,
              marginRight: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewType('monthly')}
            style={{
              backgroundColor: viewType === 'monthly' ? '#1E90FF' : '#1C1C1E',
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Monthly</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        {collections.length === 0 ? (
          <Text style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center', marginTop: 16 }}>
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
                marginBottom: 16,
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
              <Text style={{ color: '#A9A9A9', fontSize: 14, marginBottom: 8 }}>
                Type: {collection.type || 'Custom'}
              </Text>
              <Text style={{ color: '#A9A9A9', fontSize: 14, marginBottom: 8 }}>
                Showing {viewType} data
              </Text>
              {renderLineChart(collection.entries)}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
