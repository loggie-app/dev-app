import { View, Text, SafeAreaView, FlatList, Animated, TouchableOpacity } from 'react-native';
import { layout, typography, common, colors } from '../components/common/styles';
import { useRef, useState, useEffect } from 'react';
import * as collectionService from '../services/collectionService';
import { normalizeDate } from '../utils/dateUtils';
import CalendarEntryList from '../components/calendar/CalendarEntryList';

export default function CalendarScreen() {
  const [currentIndex, setCurrentIndex] = useState(12);
  const [selectedDate, setSelectedDate] = useState(null);
  const [collections, setCollections] = useState([]);
  const [dateEntries, setDateEntries] = useState({});  // Store entries by date
  const [selectedDateEntries, setSelectedDateEntries] = useState([]);
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCollectionsData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const normalizedDate = normalizeDate(selectedDate).getTime();
      setSelectedDateEntries(dateEntries[normalizedDate] || []);
    }
  }, [selectedDate, dateEntries]);

  const loadCollectionsData = async () => {
    try {
      const loadedCollections = await collectionService.loadCollections();
      setCollections(loadedCollections);

      // Load all entries and organize them by date
      const entriesByDate = {};
      await Promise.all(loadedCollections.map(async (collection) => {
        const entries = await collectionService.loadCollectionEntries(collection.id);
        entries.forEach(entry => {
          const normalizedDate = normalizeDate(new Date(entry.date)).getTime();
          if (!entriesByDate[normalizedDate]) {
            entriesByDate[normalizedDate] = [];
          }
          entriesByDate[normalizedDate].push({
            ...entry,
            collectionName: collection.name
          });
        });
      }));
      setDateEntries(entriesByDate);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const hasEntriesForDate = (date) => {
    const normalizedDate = normalizeDate(date).getTime();
    return dateEntries[normalizedDate]?.length > 0;
  };

  const generateMonths = () => {
    const months = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    for (let offset = -12; offset <= 12; offset++) {
      const monthDate = new Date(currentYear, currentMonth + offset, 1);
      months.push({
        key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        year: monthDate.getFullYear(),
        month: monthDate.getMonth(),
        label: monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      });
    }

    return months.reverse();
  };

  const months = generateMonths();

  const generateCalendarData = (year, month) => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = endOfMonth.getDate();

    const calendarDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      calendarDays.push({
        date: currentDate,
        day: currentDate.getDate(),
        isToday: currentDate.toDateString() === new Date().toDateString(),
        hasEntries: hasEntriesForDate(currentDate)
      });
    }
    return calendarDays;
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderDay = ({ item }) => {
    const isSelected = selectedDate && item.date.toDateString() === selectedDate.toDateString();
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item.date)}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          margin: 4,
          borderRadius: 20,
          backgroundColor: isSelected 
            ? colors.primary 
            : item.isToday 
              ? colors.primary 
              : 'transparent',
        }}
      >
        <Text
          style={{
            color: (isSelected || item.isToday) ? colors.text.primary : colors.text.secondary,
            fontWeight: (isSelected || item.isToday) ? 'bold' : 'normal',
          }}
        >
          {item.day}
        </Text>
        {item.hasEntries && !isSelected && (
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.primary,
              position: 'absolute',
              bottom: 2,
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderMonth = ({ item, index }) => {
    const calendarData = generateCalendarData(item.year, item.month);

    const opacity = scrollY.interpolate({
      inputRange: [
        index * 300 - 300,
        index * 300,
        index * 300 + 300,
      ],
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ marginBottom: 16, opacity }}>
        <Text
          style={[
            typography.header,
            { textAlign: 'center', marginBottom: 16 },
          ]}
        >
          {item.label}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <Text
              key={index}
              style={[typography.body, { textAlign: 'center', width: 40 }]}
            >
              {day}
            </Text>
          ))}
        </View>

        <FlatList
          data={calendarData}
          keyExtractor={(item) => item.date.toISOString()}
          numColumns={7}
          renderItem={renderDay}
          contentContainerStyle={{ marginTop: 16 }}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={layout.safeArea}>
      <View style={{ flex: 1 }}>
        <View style={{ height: 400 }}>
          <Animated.FlatList
            data={months}
            ref={flatListRef}
            keyExtractor={(item) => item.key}
            renderItem={renderMonth}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialScrollIndex={currentIndex}
            getItemLayout={(data, index) => ({
              length: 300,
              offset: 300 * index,
              index,
            })}
          />
        </View>
        
        {selectedDate && (
          <CalendarEntryList entries={selectedDateEntries} />
        )}
      </View>
    </SafeAreaView>
  );
}