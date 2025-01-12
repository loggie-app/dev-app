import { View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, typography } from './styles';

export default function Header({ title, onPressAdd }) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16
    }}>
      <Text style={typography.header}>{title}</Text>
      <TouchableOpacity onPress={onPressAdd}>
        <Plus color={colors.primary} size={24} />
      </TouchableOpacity>
    </View>
  );
}