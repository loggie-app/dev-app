import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Image,
  StyleSheet,
} from 'react-native';

export default function SettingsScreen() {
  const handleAboutPress = () => {
    Linking.openURL('https://splat.sh/'); // Open the "About" page link
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* About Button */}
      <View style={styles.content}>
        <TouchableOpacity onPress={handleAboutPress} style={styles.button}>
          <Text style={styles.buttonText}>About</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This app is still being developed. Thank you for your support!
        </Text>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/splat.png')} // Correct path to the PNG file
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Splat Apps Ltd.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#A9A9A9',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
