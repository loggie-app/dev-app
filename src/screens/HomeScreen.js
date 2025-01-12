import { ScrollView, View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { layout, typography, colors, common } from '../components/common/styles';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Plus, ChevronRight } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const getCurrentWeekDates = () => {
    const currentDate = new Date();
    const startOfWeek = currentDate.getDate() - currentDate.getDay() + 1; // Start of the week (Monday)
    return Array.from({ length: 7 }, (_, i) => {
      const weekDate = new Date();
      weekDate.setDate(startOfWeek + i);
      weekDate.setHours(0, 0, 0, 0); // Normalize time to midnight
      return weekDate;
    });
  };

  const calculateTargetStats = (collection, entries) => {
  if (!collection.customFields) return [];
  
  const stats = [];
  const now = new Date();

  collection.customFields.forEach(field => {
    // Handle boolean fields with targets
    if (field.type === 'boolean' && field.target) {
      const targetValue = field.target.value;
      const timeFrame = field.target.timeFrame;

      const filteredEntries = entries.filter(entry => {
        if (entry[field.name] !== true) return false;
        const entryDate = new Date(entry.date);

        if (timeFrame === 'day') {
          return entryDate.toDateString() === now.toDateString();
        } else if (timeFrame === 'week') {
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return entryDate >= startOfWeek && entryDate <= endOfWeek;
        } else if (timeFrame === 'month') {
          return (
            entryDate.getMonth() === now.getMonth() &&
            entryDate.getFullYear() === now.getFullYear()
          );
        }
        return false;
      });

      const count = filteredEntries.length;
      stats.push({
        fieldName: field.name,
        type: 'boolean',
        targetValue,
        timeFrame,
        count,
        complete: count >= targetValue
      });
    }

// Handle number and duration fields with limits or targets
if ((field.type === 'number' || field.type === 'duration') && field.trackingType) {
  const timeFrame = field.limit?.timeFrame || field.target?.timeFrame;
  const trackingType = field.trackingType;

  if (timeFrame) {
    const now = new Date();
    const startOfPeriod = new Date(now);
    let endOfPeriod = new Date(now);

    if (timeFrame === 'week') {
      // Set to start of week (Monday)
      startOfPeriod.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      startOfPeriod.setHours(0, 0, 0, 0);
      // Set to end of week (Sunday)
      endOfPeriod = new Date(startOfPeriod);
      endOfPeriod.setDate(startOfPeriod.getDate() + 6);
      endOfPeriod.setHours(23, 59, 59, 999);
    } else if (timeFrame === 'month') {
      startOfPeriod.setDate(1);
      startOfPeriod.setHours(0, 0, 0, 0);
      endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      // day
      startOfPeriod.setHours(0, 0, 0, 0);
      endOfPeriod.setHours(23, 59, 59, 999);
    }

    const relevantEntries = entries;

    if (field.type === 'number') {
      const value = field.limit?.value || field.target?.value;
      
      const total = relevantEntries.reduce((sum, entry) => {
        const entryValue = parseInt(entry[field.name], 10);
        if (!isNaN(entryValue)) {
          return sum + entryValue;
        }
        return sum;
      }, 0);

      stats.push({
        fieldName: field.name,
        type: 'number',
        trackingType,
        value,
        timeFrame,
        total,
        complete: trackingType === 'Set Target' ? total >= value : total <= value
      });
    } else if (field.type === 'duration') {
      const targetHours = field.limit?.hours || field.target?.hours || 0;
      const targetMinutes = field.limit?.minutes || field.target?.minutes || 0;
      
      const total = relevantEntries.reduce((sum, entry) => {
        const hours = parseInt(entry[`${field.name}_hours`], 10) || 0;
        const minutes = parseInt(entry[`${field.name}_minutes`], 10) || 0;
        return sum + (hours * 60 + minutes);
      }, 0);

      const totalHours = Math.floor(total / 60);
      const totalMinutes = total % 60;
      const targetTotalMinutes = (targetHours * 60) + targetMinutes;

      stats.push({
        fieldName: field.name,
        type: 'duration',
        trackingType,
        currentHours: totalHours,
        currentMinutes: totalMinutes,
        targetHours,
        targetMinutes,
        timeFrame,
        complete: trackingType === 'Set Target' ? total >= targetTotalMinutes : total <= targetTotalMinutes
      });
    }
  }
}

  });

  return stats;
};

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

          const targetStats = calculateTargetStats(collection, entries);

          // Highlight only days in the current week
          const currentWeekDates = getCurrentWeekDates();

          const activeDays = entries.reduce((days, entry) => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0); // Normalize time to midnight

            currentWeekDates.forEach((weekDate, index) => {
              weekDate.setHours(0, 0, 0, 0); // Normalize week date to midnight
              if (
                entryDate.getTime() === weekDate.getTime() &&
                !days.includes(index + 1)
              ) {
                days.push(index + 1); // Add day index (1 = Monday, 7 = Sunday)
              }
            });
            return days;
          }, []);

          const lastUpdated = entries.reduce((latest, entry) => {
            const entryDate = new Date(entry.date);
            return entryDate > new Date(latest) ? entry.date : latest;
          }, null);

          return {
            ...collection,
            entriesCount: entries.length,
            lastUpdated,
            activeDays,
            targetStats,
          };
        })
      );

      setCollections(updatedCollections);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCollections);
    loadCollections();
    return unsubscribe;
  }, [navigation]);

  const handleDeleteCollection = async (collectionId) => {
    try {
      const storedCollectionsJSON = await AsyncStorage.getItem('collections');
      const storedCollections = storedCollectionsJSON
        ? JSON.parse(storedCollectionsJSON)
        : [];

      const updatedCollections = storedCollections.filter(
        (collection) => collection.id !== collectionId
      );
      await AsyncStorage.setItem('collections', JSON.stringify(updatedCollections));

      const collectionToDelete = collections.find(
        (collection) => collection.id === collectionId
      );
      if (collectionToDelete && collectionToDelete.path) {
        await FileSystem.deleteAsync(collectionToDelete.path);
      }

      setCollections((prev) =>
        prev.filter((collection) => collection.id !== collectionId)
      );
    } catch (error) {
      console.error('Failed to delete collection:', error);
      Alert.alert('Error', 'Failed to delete the collection.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCollectionPress = (collection) => {
    navigation.navigate('CollectionDetail', { collection });
  };

  const renderWeekdayBar = (activeDays) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    const todayIndex = getCurrentWeekDates().findIndex(
      (weekDate) => weekDate.getTime() === today.getTime()
    );

    return (
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        {weekdays.map((day, index) => {
          const isActive = activeDays.includes(index + 1); // Map to Mon-Sun (1-7)
          const isToday = index === todayIndex;

          return (
            <View
              key={index}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                marginHorizontal: 2,
                borderRadius: 12,
                backgroundColor: isToday
                  ? '#FFD70055' // Highlight today
                  : isActive
                  ? colors.primary
                  : '#2C2C2E',
              }}
            >
              <Text
                style={{
                  color: isActive || isToday ? colors.text.primary : colors.text.secondary,
                  fontWeight: isActive || isToday ? 'bold' : 'normal',
                  fontSize: 12,
                }}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={layout.safeArea}>
      <ScrollView contentContainerStyle={layout.screen}>
        {collections.length === 0 ? (
          <View style={[common.card, { alignItems: 'center', padding: 20 }]}>
            <Text style={typography.body}>No collections yet</Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
              }}
              onPress={() => navigation.navigate('AddCollection')}
            >
              <Text style={[typography.body, { color: '#FFF' }]}>Add Your First Collection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          collections.map((collection) => (
            <TouchableOpacity
              key={collection.id}
              style={{
                backgroundColor: '#1C1C1E',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              activeOpacity={0.7}
              onPress={() => handleCollectionPress(collection)}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    typography.body,
                    { fontSize: 18, fontWeight: '600' },
                  ]}
                >
                  {collection.name}
                </Text>
                <Text style={[typography.caption, { marginTop: 4 }]}>Custom Collection</Text>

                {/* Weekday Bar */}
                {renderWeekdayBar(collection.activeDays)}

                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <View
                    style={{
                      backgroundColor: '#2C2C2E',
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 6,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={[typography.caption, { color: colors.primary }]}
                    >
                      {`${collection.entriesCount || 0} Entries`}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: '#2C2C2E',
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={[typography.caption, { color: colors.primary }]}
                    >
                      Last updated:{' '}
                      {collection.lastUpdated
                        ? formatDate(collection.lastUpdated)
                        : 'Unknown'}
                    </Text>
                  </View>
                </View>

{collection.targetStats && collection.targetStats.length > 0 && (
  <View style={{ marginTop: 8 }}>
    {collection.targetStats.map((stat) => (
      <Text
        key={stat.fieldName}
        style={[
          typography.caption,
          {
            color: colors.primary, // Always show in primary color for better visibility
            marginBottom: 2,
          },
        ]}
      >
        {stat.type === 'boolean' ? (
          // Display for boolean targets with checkmark
          `${stat.fieldName}: ${stat.count}/${stat.targetValue} ${stat.timeFrame}${
            stat.complete ? ' ✅' : ''
          }`
        ) : stat.type === 'number' ? (
          // Display for number limits/targets with checkmark
          `${stat.fieldName}: ${stat.total}/${stat.value} ${stat.timeFrame}${
            stat.complete ? (stat.trackingType === 'Set Limit' ? ' ✅ Under Limit' : ' ✅ Target Met') : ''
          }`
        ) : stat.type === 'duration' ? (
          // Display for duration targets
          `${stat.fieldName}: ${stat.currentHours}h ${stat.currentMinutes}m / ${stat.targetHours}h ${stat.targetMinutes}m ${stat.timeFrame}${
            stat.complete ? ' ✅ Target Met' : ''
          }`
        ) : null}
      </Text>
    ))}
  </View>
)}
    </View>

              <ChevronRight color={colors.text.secondary} size={20} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
