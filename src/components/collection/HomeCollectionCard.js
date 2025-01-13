import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { typography, colors } from '../../components/common/styles';

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const HomeCollectionCard = ({ collection, onPress }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderWeekdayBar = (activeDays) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getCurrentWeekDates = () => {
      const currentDate = new Date();
      const startOfWeek = currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1);
      return Array.from({ length: 7 }, (_, i) => {
        const weekDate = new Date();
        weekDate.setDate(startOfWeek + i);
        weekDate.setHours(0, 0, 0, 0);
        return weekDate;
      });
    };

    const todayIndex = getCurrentWeekDates().findIndex(
      (weekDate) => weekDate.getTime() === today.getTime()
    );

    return (
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        {weekdays.map((day, index) => {
          const isActive = activeDays.includes(index + 1);
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
                  ? '#FFD70055'
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
    <TouchableOpacity
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
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { fontSize: 18, fontWeight: '600' }]}>
          {collection.name}
        </Text>
        <Text style={[typography.caption, { marginTop: 4 }]}>Custom Collection</Text>

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
            <Text style={[typography.caption, { color: colors.primary }]}>
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
            <Text style={[typography.caption, { color: colors.primary }]}>
              Last updated:{' '}
              {collection.lastUpdated ? formatDate(collection.lastUpdated) : 'Unknown'}
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
                    color: colors.primary,
                    marginBottom: 2,
                  },
                ]}
              >
                {stat.type === 'boolean'
                  ? `${stat.fieldName}: ${stat.count}/${stat.targetValue} ${stat.timeFrame}${
                      stat.complete ? ' ✅' : ''
                    }`
                  : stat.type === 'number'
                  ? `${stat.fieldName}: ${stat.total}/${stat.value} ${stat.timeFrame}${
                      stat.complete
                        ? stat.trackingType === 'Set Limit'
                          ? ' ✅ Under Limit'
                          : ' ✅ Target Met'
                        : ''
                    }`
                  : stat.type === 'duration'
                  ? `${stat.fieldName}: ${stat.currentHours}h ${stat.currentMinutes}m / ${
                      stat.targetHours
                    }h ${stat.targetMinutes}m ${stat.timeFrame}${
                      stat.complete ? ' ✅ Target Met' : ''
                    }`
                  : null}
              </Text>
            ))}
          </View>
        )}
      </View>
      <ChevronRight color={colors.text.secondary} size={20} />
    </TouchableOpacity>
  );
};

export default HomeCollectionCard;