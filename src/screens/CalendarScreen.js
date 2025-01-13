import { View, Text, SafeAreaView, FlatList, Animated, TouchableOpacity } from 'react-native';
import { layout, typography, common, colors } from '../components/common/styles';
import { useRef, useState } from 'react';

export default function CalendarScreen() {
  const [currentIndex, setCurrentIndex] = useState(12);
  const [selectedDate, setSelectedDate] = useState(null); // Add selected date state
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

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
    </SafeAreaView>
  );
}