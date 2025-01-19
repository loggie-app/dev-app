import React, { useRef, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, Animated, TouchableOpacity } from 'react-native';
import { layout, typography, colors } from '../components/common/styles';
import CalendarEntryList from '../components/calendar/CalendarEntryList';
import { useCalendarData } from '../hooks/useCalendarData';
import { 
  MONTHS_TO_SHOW,
  ITEM_HEIGHT,
  WEEKDAYS,
  generateMonthsData,
  generateCalendarData
} from '../utils/calendarUtils';

const CalendarScreen = () => {
  const {
    dateEntries,
    dateStatuses,
    selectedDate,
    selectedDateEntries,
    setSelectedDate
  } = useCalendarData();

  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentIndex = MONTHS_TO_SHOW - 13; // Center on current month

  const months = useMemo(() => generateMonthsData(), []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const renderDay = useCallback(({ item, index }) => {
    if (item.isPadding) {
      return (
        <View 
          style={{ 
            width: '14.28%', // 100% / 7 for equal column widths
            aspectRatio: 1,
            padding: 4 
          }} 
        />
      );
    }

    const isSelected = selectedDate && item.date.toDateString() === selectedDate.toDateString();
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item.date)}
        style={{
          width: '14.28%', // 100% / 7 for equal column widths
          aspectRatio: 1,
          padding: 4
        }}
      >
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 20,
          backgroundColor: isSelected 
            ? colors.primary 
            : item.isToday 
              ? 'rgba(128, 128, 128, 0.3)' 
              : item.status?.hasExceededLimit 
                ? 'rgba(255, 59, 48, 0.2)' 
                : item.status?.hasMetTarget 
                  ? 'rgba(52, 199, 89, 0.2)' 
                  : 'transparent',
        }}>
          <Text
            style={{
              color: isSelected ? colors.text.primary : item.isToday ? colors.text.primary : colors.text.secondary,
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
        </View>
      </TouchableOpacity>
    );
  }, [selectedDate, setSelectedDate]);

  const renderMonth = useCallback(({ item, index }) => {
    const calendarData = generateCalendarData(item.year, item.month, dateEntries, dateStatuses);
    
    const opacity = scrollY.interpolate({
      inputRange: [
        (index - 1) * ITEM_HEIGHT,
        index * ITEM_HEIGHT,
        (index + 1) * ITEM_HEIGHT,
      ],
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={{ 
          opacity,
          height: ITEM_HEIGHT,
          paddingBottom: 60,
          marginBottom: 20
        }}
      >
        <Text style={[typography.header, { 
          textAlign: 'center', 
          marginBottom: 24,
          marginTop: 16,
          fontSize: 32,
          fontWeight: 'bold'
        }]}>
          {item.label}
        </Text>

        {/* Weekday Headers */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          paddingHorizontal: 4,
          marginBottom: 8
        }}>
          {WEEKDAYS.map((day, index) => (
            <View 
              key={index} 
              style={{ 
                width: '14.28%', // 100% / 7 for equal column widths
                alignItems: 'center' 
              }}
            >
              <Text style={typography.body}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Days Grid */}
        <View style={{ flex: 1 }}>
          <FlatList
            data={calendarData}
            numColumns={7}
            renderItem={renderDay}
            keyExtractor={item => item.key}
            scrollEnabled={false}
            removeClippedSubviews={true}
            initialNumToRender={42}
            maxToRenderPerBatch={42}
            windowSize={1}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </View>
      </Animated.View>
    );
  }, [dateEntries, dateStatuses, renderDay, scrollY]);

  return (
    <SafeAreaView style={layout.safeArea}>
      <View style={{ flex: 1 }}>
        <Animated.View style={{ 
          flex: selectedDate ? 0.6 : 1,
          height: selectedDate ? undefined : '100%'
        }}>
          <Animated.FlatList
            ref={flatListRef}
            data={months}
            keyExtractor={item => item.key}
            renderItem={renderMonth}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            initialScrollIndex={currentIndex}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            maxToRenderPerBatch={3}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </Animated.View>
        
        {selectedDate && (
          <Animated.View style={{ 
            flex: 0.4,
            borderTopWidth: 1,
            borderTopColor: '#2C2C2E',
            backgroundColor: colors.background
          }}>
            <CalendarEntryList entries={selectedDateEntries} />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(CalendarScreen);