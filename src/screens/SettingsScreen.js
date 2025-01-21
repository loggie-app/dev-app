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
import { BarChart2, Calendar, LineChart, Clock } from 'lucide-react-native';
import { colors } from '../components/common/styles';

export default function SettingsScreen() {
  const handleAboutPress = () => {
    Linking.openURL('https://splat.sh/');
  };

  const handleGuidePress = () => {
    Linking.openURL('https://splat.sh/loggie-guide');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* App Logo */}
      <View style={styles.logoHeader}>
        <Image 
          source={require('../../assets/icon.png')}
          style={styles.appLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        {/* Description */}
        <Text style={styles.description}>
          Track almost everything with Loggie, and get real time data of your progress!
        </Text>

        {/* Guide Button */}
        <TouchableOpacity onPress={handleGuidePress} style={styles.button}>
          <Text style={styles.buttonText}>Loggie Guide</Text>
        </TouchableOpacity>

        {/* Features Overview */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Key Features</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <BarChart2 color={colors.primary} size={24} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Custom Collections</Text>
              <Text style={styles.featureDescription}>Create and customize your own tracking collections</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Calendar color={colors.primary} size={24} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Calendar View</Text>
              <Text style={styles.featureDescription}>Track your progress day by day</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <LineChart color={colors.primary} size={24} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Detailed Reports</Text>
              <Text style={styles.featureDescription}>Analyze your data with visual reports</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Clock color={colors.primary} size={24} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Real-time Tracking</Text>
              <Text style={styles.featureDescription}>Monitor your goals as you progress</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for your support!
        </Text>
        
        <TouchableOpacity onPress={handleAboutPress} style={styles.logoContainer}>
          <Image
            source={require('../../assets/splat.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Splat Apps Ltd.</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoHeader: {
    alignItems: 'center',
    marginVertical: -10,
  },
  appLogo: {
    height: 80,
    width: 150,
  },
  content: {
    paddingHorizontal: 16,
    flex: 1,
  },
  description: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  aboutButton: {
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  logoText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});