import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { layout, typography, colors, common } from '../components/common/styles';
import { Plus, Calendar, BarChart, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function CollectionDetailScreen({ route, navigation }) {
  const { collection } = route.params;
  const [entries, setEntries] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {  // Changed to GB format for dd/mm/yyyy
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '/');  // Ensure forward slashes
  };

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const entriesKey = `entries_${collection.id}`;
        const entriesJSON = await AsyncStorage.getItem(entriesKey);
        const savedEntries = entriesJSON ? JSON.parse(entriesJSON) : [];
        // Sort entries by id to maintain order
        savedEntries.sort((a, b) => a.id - b.id);
        setEntries(savedEntries);
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadEntries);
    loadEntries();
    return unsubscribe;
  }, [navigation, collection.id]);

  const calculateTargetStats = () => {
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

      // Handle number fields with limits or targets
// Handle number fields with limits or targets
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

  const targetStats = calculateTargetStats();

  const handleAddEntry = () => {
    navigation.navigate('AddEntry', { collection });
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const updatedEntries = entries.filter((entry) => entry.id !== entryId);
      setEntries(updatedEntries);

      const entriesKey = `entries_${collection.id}`;
      await AsyncStorage.setItem(entriesKey, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error deleting entry:', error);
      Alert.alert('Error', 'Failed to delete the entry. Please try again.');
    }
  };

  const handleDeleteCollection = async () => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete the collection "${collection.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all entries for this collection
              const entriesKey = `entries_${collection.id}`;
              await AsyncStorage.removeItem(entriesKey);

              // Delete the collection from AsyncStorage
              const storedCollectionsJSON = await AsyncStorage.getItem('collections');
              const storedCollections = storedCollectionsJSON ? JSON.parse(storedCollectionsJSON) : [];
              const updatedCollections = storedCollections.filter((col) => col.id !== collection.id);

              await AsyncStorage.setItem('collections', JSON.stringify(updatedCollections));

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
        <View style={[common.card, { marginBottom: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={[typography.body, { fontSize: 18, fontWeight: '600' }]}>Statistics</Text>
            <TouchableOpacity>
              <BarChart color={colors.primary} size={24} />
            </TouchableOpacity>
          </View>

          {targetStats.length > 0 && (
            <View style={{ marginBottom: 16 }}>
{targetStats.map(stat => (
  <Text
    key={stat.fieldName}
    style={[
      typography.body,
      { 
        fontSize: 16, 
        color: stat.complete ? colors.primary : colors.text.secondary,
        marginBottom: 4
      }
    ]}
  >
    {stat.type === 'boolean' ? (
      `${stat.fieldName}: ${stat.count}/${stat.targetValue} ${stat.timeFrame}`
    ) : stat.type === 'duration' ? (
      `${stat.fieldName}: ${stat.currentHours}h ${stat.currentMinutes}m/${stat.targetHours}h ${stat.targetMinutes}m ${stat.timeFrame}${stat.complete ? ' ✅ Target Met' : ''}`
    ) : (
      `${stat.fieldName}: ${stat.total}/${stat.value} ${stat.timeFrame}${stat.complete ? (stat.trackingType === 'Set Limit' ? ' ✅ Under Limit' : ' ✅ Target Met') : ''}`
    )}
  </Text>
))}
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={typography.caption}>Total Entries</Text>
              <Text style={[typography.body, { fontSize: 24, fontWeight: '600' }]}>{entries.length}</Text>
            </View>
            <View>
              <Text style={typography.caption}>Last Entry</Text>
              <Text style={[typography.body, { fontSize: 16 }]}>
                {entries.length > 0 ? formatDate(entries[entries.length - 1].date) : 'Never'}
              </Text>
            </View>
          </View>
        </View>

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
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Calendar color={colors.text.secondary} size={48} />
              <Text style={[typography.body, { marginTop: 16, color: colors.text.secondary }]}>
                No entries yet
              </Text>
              <Text style={[typography.caption, { marginTop: 8, textAlign: 'center' }]}>
                Tap the Add Entry button above {'\n'}to get started
              </Text>
            </View>
          ) : (
            entries.map((entry) => (
              <View
                key={entry.id}
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
{/* Display all custom fields dynamically */}
{Object.keys(entry).map((key) => {
  if (key !== 'id' && key !== 'createdAt' && key !== 'date') {
    // Check if this is a duration field by looking for _hours suffix
    if (key.endsWith('_hours')) {
      const baseName = key.replace('_hours', '');
      const hours = entry[key] || 0;
      const minutes = entry[`${baseName}_minutes`] || 0;
      return (
        <Text key={baseName} style={[typography.body, { fontSize: 16 }]}>
          {`${baseName}: ${hours}h ${minutes}m`}
        </Text>
      );
    } else if (!key.endsWith('_minutes')) { // Skip _minutes fields as they're handled with _hours
      return (
        <Text key={key} style={[typography.body, { fontSize: 16 }]}>
          {`${key}: ${entry[key]}`}
        </Text>
      );
    }
  }
  return null;
})}
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    {entry.description || 'No description'}
                  </Text>
                  <Text style={[typography.caption, { marginTop: 8, color: colors.text.secondary }]}>
                    {formatDate(entry.date)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)}>
                  <Trash2 color={colors.text.secondary} size={20} />
                </TouchableOpacity>
              </View>
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