// src/components/reports/CollectionTargetGraphs.js
import React, { useMemo } from 'react';
import { View, Text, Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { typography, colors } from '../common/styles';
import { calculatePeriodValue, aggregateFieldEntries } from '../../utils/reportCalculations';
import { findBreakpoint, getStartOfWeek } from '../../utils/chartUtils';
import { convertDurationToMinutes } from '../../utils/durationUtils';

const CollectionTargetGraphs = ({ fields, entries, viewType = 'weekly' }) => {
  const screenWidth = Dimensions.get('window').width - 55;

  const generateChartData = useMemo(() => (field, timeframe) => {
    const today = new Date();
    let data = [];
    let cumulativeData = [];
    let runningTotal = 0;
    let labels = [];

    // Calculate period values with proper monthly conversion
    let periodLimit = null;
    let periodTarget = null;

    if (field.type === 'duration') {
      if (field.limit) {
        const limitMinutes = convertDurationToMinutes(field.limit.hours || 0, field.limit.minutes || 0);
        periodLimit = calculatePeriodValue(
          limitMinutes,
          field.limit.timeFrame,
          timeframe === 'weekly' ? 'week' : 'month'
        );
      }
      if (field.target) {
        const targetMinutes = convertDurationToMinutes(field.target.hours || 0, field.target.minutes || 0);
        periodTarget = calculatePeriodValue(
          targetMinutes,
          field.target.timeFrame,
          timeframe === 'weekly' ? 'week' : 'month'
        );
      }
    } else {
      periodLimit = field.limit ? calculatePeriodValue(
        field.limit.value,
        field.limit.timeFrame,
        timeframe === 'weekly' ? 'week' : 'month'
      ) : null;

      periodTarget = field.target ? calculatePeriodValue(
        field.target.value,
        field.target.timeFrame,
        timeframe === 'weekly' ? 'week' : 'month'
      ) : null;
    }

    if (timeframe === 'weekly') {
      const startOfWeek = getStartOfWeek(today);
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        
        const dayValue = aggregateFieldEntries(entries, field, currentDate);
        data.push(dayValue);
        runningTotal += dayValue;
        cumulativeData.push(runningTotal);
        
        const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        labels.push(dayLabels[i]);
      }
    } else {
      // Monthly view - On Android, we'll limit to 4 weeks for performance
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const weeksInMonth = Platform.OS === 'android' ? 4 : Math.ceil(daysInMonth / 7);
      
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      
      for (let week = 0; week < weeksInMonth; week++) {
        let weekTotal = 0;
        for (let day = 0; day < 7; day++) {
          const currentDate = new Date(startOfMonth);
          currentDate.setDate(startOfMonth.getDate() + (week * 7) + day);
          
          if (currentDate.getMonth() === currentMonth) {
            weekTotal += aggregateFieldEntries(entries, field, currentDate);
          }
        }
        data.push(weekTotal);
        runningTotal += weekTotal;
        cumulativeData.push(runningTotal);
        labels.push(`W${week + 1}`);
      }
    }

    const hasReachedLimit = periodLimit ? cumulativeData.some(value => value >= periodLimit) : false;
    const hasReachedTarget = periodTarget ? cumulativeData.some(value => value >= periodTarget) : false;

    const datasets = [
      {
        data: cumulativeData,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        withDots: Platform.OS === 'ios',  // Disable dots on Android
        strokeWidth: 2,
      }
    ];

    if (periodLimit) {
      datasets.push({
        data: Array(labels.length).fill(periodLimit),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        withDots: false,
        strokeWidth: 1,
        strokeDasharray: Platform.OS === 'ios' ? [5, 5] : undefined, // Remove dash pattern on Android
      });
    }

    if (periodTarget) {
      datasets.push({
        data: Array(labels.length).fill(periodTarget),
        color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
        withDots: false,
        strokeWidth: 1,
      });
    }

    return {
      labels,
      datasets,
      hasReachedLimit,
      hasReachedTarget,
      data: cumulativeData,
      periodLimit,
      periodTarget
    };
  }, [entries]);

  const renderGraph = (field) => {
    const chartData = generateChartData(field, viewType);
    const chartHeight = Platform.OS === 'android' ? 180 : 220; // Reduce height on Android

    return (
      <View key={field.name} style={{ marginBottom: 20, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[typography.body]}>{field.name}</Text>
          {chartData.hasReachedLimit && (
            <View style={{ 
              backgroundColor: '#ef4444',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4,
              marginLeft: 8
            }}>
              <Text style={{ color: 'white', fontSize: 12 }}>Limit reached</Text>
            </View>
          )}
          {chartData.hasReachedTarget && !chartData.hasReachedLimit && (
            <View style={{ 
              backgroundColor: '#22c55e',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4,
              marginLeft: 8
            }}>
              <Text style={{ color: 'white', fontSize: 12 }}>Target met</Text>
            </View>
          )}
        </View>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={chartHeight}
          withInnerLines={Platform.OS === 'ios'}  // Disable inner lines on Android
          withVerticalLines={Platform.OS === 'ios'} // Disable vertical lines on Android
          withHorizontalLines={Platform.OS === 'ios'} // Disable horizontal lines on Android
          fromZero={true}
          segments={Platform.OS === 'android' ? 2 : 4} // Reduce segments on Android
          chartConfig={{
            backgroundColor: '#1C1C1E',
            backgroundGradientFrom: '#1C1C1E',
            backgroundGradientTo: '#1C1C1E',
            decimalPlaces: field.type === 'duration' ? 1 : 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            fillShadowGradient: Platform.OS === 'ios' ? (
              chartData.hasReachedLimit 
                ? 'rgba(239, 68, 68, 0.1)'
                : chartData.hasReachedTarget 
                  ? 'rgba(74, 222, 128, 0.1)'
                  : 'transparent'
            ) : 'transparent',
            fillShadowGradientOpacity: Platform.OS === 'ios' ? 0.5 : 0,
            propsForBackgroundLines: {
              strokeDasharray: [], // Remove dash pattern
              strokeWidth: Platform.OS === 'android' ? 0.5 : 1,
            },
            strokeWidth: Platform.OS === 'android' ? 1 : 2,
            propsForLabels: {
              fontSize: Platform.OS === 'android' ? 10 : 12
            },
            propsForDots: {
              r: Platform.OS === 'android' ? '2' : '4',
              strokeWidth: Platform.OS === 'android' ? '1' : '2',
              stroke: '#FFFFFF'
            },
            formatYLabel: (value) => {
              if (field.type === 'duration') {
                const hours = Math.floor(value / 60);
                const minutes = Math.round(value % 60);
                return `${hours}:${minutes.toString().padStart(2, '0')}`;
              }
              return Math.round(value).toString();
            },
          }}
          bezier
          style={{
            marginVertical: Platform.OS === 'android' ? 8 : 0,
          }}
        />
      </View>
    );
  };

  return (
    <View style={{ paddingHorizontal: 4 }}>
      {fields.map(field => {
        if ((field.target || field.limit) && 
            ['boolean', 'number', 'duration'].includes(field.type)) {
          return renderGraph(field);
        }
        return null;
      })}
    </View>
  );
};

export default React.memo(CollectionTargetGraphs);