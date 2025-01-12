import { View, Text, SafeAreaView } from 'react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' }}>
          Settings
        </Text>
      </View>
    </SafeAreaView>
  );
}