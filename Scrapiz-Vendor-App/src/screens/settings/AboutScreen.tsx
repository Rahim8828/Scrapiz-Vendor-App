import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface AboutScreenProps {
  onBack: () => void;
}

const AboutScreen = ({ onBack }: AboutScreenProps) => {
  const appInfo = {
    version: '1.0.0',
    buildNumber: '100',
    releaseDate: 'December 2024',
    developer: 'Scrapiz Technologies Pvt Ltd',
  };





  const handlePrivacyPolicy = async () => {
    const url = 'https://scrapiz.com/privacy-policy';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open privacy policy');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open privacy policy');
    }
  };

  const handleTermsOfService = async () => {
    const url = 'https://scrapiz.com/terms-of-service';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open terms of service');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open terms of service');
    }
  };

  const handleWebsite = async () => {
    const url = 'https://scrapiz.com';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open website');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open website');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>About</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* App Info */}
          <View style={styles.appInfoCard}>
            <View style={styles.appLogo}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.appName}>Scrapiz Vendor</Text>
            <Text style={styles.appVersion}>Version {appInfo.version}</Text>
          </View>

          {/* Quick Links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity style={styles.linkButton} onPress={handleWebsite}>
              <MaterialIcons name="language" size={20} color="#1B7332" />
              <Text style={styles.linkText}>Visit Website</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={handlePrivacyPolicy}>
              <MaterialIcons name="privacy-tip" size={20} color="#1B7332" />
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={handleTermsOfService}>
              <MaterialIcons name="description" size={20} color="#1B7332" />
              <Text style={styles.linkText}>Terms of Service</Text>
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <View style={styles.copyrightContainer}>
            <Text style={styles.copyrightText}>© 2024 Scrapiz Technologies</Text>
            <Text style={styles.copyrightSubtext}>Made with ❤️ in India</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#1B7332',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  appInfoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
    width: '100%',
  },
  appLogo: {
    width: 64,
    height: 64,
    backgroundColor: '#1B7332',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: '#6c757d',
  },
  linksContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  linkButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  copyrightContainer: {
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
    textAlign: 'center',
  },
  copyrightSubtext: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
  },
});

export default AboutScreen;