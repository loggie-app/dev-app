import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BarChart } from 'lucide-react-native';
import { typography, colors, common } from '../../components/common/styles';
import { formatDate } from '../../utils/dateUtils';

const StatRow = ({ stat }) => {
  const getStatText = () => {
    if (stat.type === 'boolean') {
      return `${stat.fieldName}: ${stat.count}/${stat.targetValue} ${stat.timeFrame}`;
    } else if (stat.type === 'duration') {
      return `${stat.fieldName}: ${stat.currentHours}h ${stat.currentMinutes}m/${stat.targetHours}h ${stat.targetMinutes}m ${stat.timeFrame}${stat.complete ? ' ✅ Target Met' : ''}`;
    } else {
      return `${stat.fieldName}: ${stat.total}/${stat.value} ${stat.timeFrame}${
        stat.complete ? (stat.trackingType === 'Set Limit' ? ' ✅ Under Limit' : ' ✅ Target Met') : ''
      }`;
    }
  };

  return (
    <Text
      style={[
        typography.body,
        {
          fontSize: 16,
          color: stat.complete ? colors.primary : colors.text.secondary,
          marginBottom: 4
        }
      ]}
    >
      {getStatText()}
    </Text>
  );
};

const StatsCard = ({ targetStats, entriesCount, lastEntryDate }) => {
  return (
    <View style={[common.card, { marginBottom: 16 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={[typography.body, { fontSize: 18, fontWeight: '600' }]}>Statistics</Text>
        <TouchableOpacity>
          <BarChart color={colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      {targetStats.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          {targetStats.map((stat, index) => (
            <StatRow key={`${stat.fieldName}-${index}`} stat={stat} />
          ))}
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={typography.caption}>Total Entries</Text>
          <Text style={[typography.body, { fontSize: 24, fontWeight: '600' }]}>{entriesCount}</Text>
        </View>
        <View>
          <Text style={typography.caption}>Last Entry</Text>
          <Text style={[typography.body, { fontSize: 16 }]}>
            {lastEntryDate ? formatDate(lastEntryDate) : 'Never'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default StatsCard;