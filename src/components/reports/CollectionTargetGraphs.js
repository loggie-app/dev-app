// src/components/reports/CollectionTargetGraphs.js
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { typography, colors } from '../common/styles';
import { calculatePeriodValue, aggregateFieldEntries } from '../../utils/reportCalculations';
import { calculateBreachPoint, generateFillGradient } from '../../utils/chartUtils';

const CollectionTargetGraphs = ({ fields, entries, viewType = 'weekly' }) => {
  const screenWidth = Dimensions.get('window').width - 40;

  const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const generateChartData = (field, timeframe) => {
    let data = [];
    let labels = [];
    let limitBreachPoint = null;
    let targetMetPoint = null;
    let cumulativeData = [];
    let runningTotal = 0;

    if (timeframe === 'weekly') {
      const today = new Date();
      const startOfWeek = getStartOfWeek(new Date(today));
      
      // Calculate initial limit and target values
      let weeklyLimit = null;
      let weeklyTarget = null;
      if (field.limit) {
        weeklyLimit = calculatePeriodValue(field.limit.value, field.limit.timeFrame, 'week');
      }
      if (field.target) {
        weeklyTarget = calculatePeriodValue(field.target.value, field.target.timeFrame, 'week');
      }

      // Generate data for each day of the week
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        
        const dayEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.toDateString() === currentDate.toDateString();
        });

        // Calculate day's value
        let dayValue = 0;
        dayEntries.forEach(entry => {
          if (field.type === 'boolean') {
            dayValue += entry[field.name] === true ? 1 : 0;
          } else if (field.type === 'number') {
            dayValue += parseFloat(entry[field.name]) || 0;
          } else if (field.type === 'duration') {
            const hours = parseInt(entry[`${field.name}_hours`], 10) || 0;
            const minutes = parseInt(entry[`${field.name}_minutes`], 10) || 0;
            dayValue += hours * 60 + minutes;
          }
        });

        data.push(dayValue);
        runningTotal += dayValue;
        cumulativeData.push(runningTotal);

        // Check for limit breach and target met
        if (weeklyLimit && !limitBreachPoint && runningTotal >= weeklyLimit) {
          limitBreachPoint = {
            index: i,
            value: runningTotal,
            dayValue: dayValue
          };
        }

        if (weeklyTarget && !targetMetPoint && runningTotal >= weeklyTarget) {
          targetMetPoint = {
            index: i,
            value: runningTotal,
            dayValue: dayValue
          };
        }

        const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        labels.push(dayLabels[i]);
      }
    } else {
      // Monthly view - similar logic but for weeks
      // ... Monthly view implementation remains the same
    }

    const datasets = [
      {
        data: cumulativeData,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        withDots: true,
        strokeWidth: 2,
      }
    ];

    // Add limit line if exists
    if (field.limit) {
      datasets.push({
        data: Array(labels.length).fill(field.limit.value),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        withDots: false,
        strokeWidth: 1,
        strokeDashArray: [5, 5],
      });
    }

    // Add target line if exists
    if (field.target) {
      datasets.push({
        data: Array(labels.length).fill(field.target.value),
        color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
        withDots: false,
        strokeWidth: 1,
      });
    }

    // Add breach point indicator
    if (limitBreachPoint) {
      datasets.push({
        data: Array(labels.length).fill(null).map((_, i) => 
          i === limitBreachPoint.index ? limitBreachPoint.value : null
        ),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        withDots: true,
        dotColor: '#ef4444',
        pointRadius: 8,
        pointStyle: 'crossRot',
      });
    }

    // Add target met indicator
    if (targetMetPoint) {
      datasets.push({
        data: Array(labels.length).fill(null).map((_, i) => 
          i === targetMetPoint.index ? targetMetPoint.value : null
        ),
        color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
        withDots: true,
        dotColor: '#22c55e',
        pointRadius: 8,
        pointStyle: 'star',
      });
    }

    return {
      labels,
      datasets,
      limitBreachPoint,
      targetMetPoint,
    };
  };

  const renderGraph = (field) => {
    const chartData = generateChartData(field, viewType);
    const hasLimit = field.limit !== null;
    const hasTarget = field.target !== null;

    return (
      <View key={field.name} style={{ marginBottom: 20, paddingHorizontal: 16 }}>
        <Text style={[typography.body, { marginBottom: 8 }]}>
          {field.name}
        </Text>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          withInnerLines={true}
          fromZero={true}
          segments={4}
          chartConfig={{
            backgroundColor: '#1C1C1E',
            backgroundGradientFrom: '#1C1C1E',
            backgroundGradientTo: '#1C1C1E',
            decimalPlaces: field.type === 'duration' ? 1 : 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            propsForBackgroundLines: {
              strokeDasharray: [],
            },
            strokeWidth: 2,
            propsForLabels: {
              fontSize: 12
            },
            formatXLabel: (label) => <Text>{label}</Text>,
            formatYLabel: (value) => {
              if (field.type === 'duration') {
                const hours = Math.floor(value / 60);
                const minutes = Math.round(value % 60);
                return <Text>{`${hours}:${minutes.toString().padStart(2, '0')}`}</Text>;
              }
              return <Text>{Math.round(value).toString()}</Text>;
            },
            horizontalLabelRotation: 0,
            verticalLabelRotation: 0,
            fillShadowGradient: chartData.limitBreachPoint 
              ? `rgba(239, 68, 68, 0.1)`
              : chartData.targetMetPoint 
                ? `rgba(74, 222, 128, 0.1)`
                : 'transparent',
            fillShadowGradientOpacity: 0.3,
          }}
          decorator={() => {
            return chartData.limitBreachPoint ? (
              <View style={{
                position: 'absolute',
                top: chartData.limitBreachPoint.value,
                left: chartData.limitBreachPoint.index * (screenWidth / 7),
                backgroundColor: '#ef4444',
                padding: 4,
                borderRadius: 4,
              }}>
                <Text style={{ color: 'white', fontSize: 10 }}>Limit reached</Text>
              </View>
            ) : null;
          }}
          style={{
            marginLeft: -10,
            marginRight: -10,
          }}
          bezier
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

export default CollectionTargetGraphs;