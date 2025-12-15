import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PrivacyScreenProps {
  onBack: () => void;
}

const PrivacyScreen = ({ onBack }: PrivacyScreenProps) => {
  const [settings, setSettings] = useState({
    locationSharing: true,
    profileVisibility: true,
    phoneNumberVisible: false,
    dataCollection: true,
    analyticsSharing: false,
    thirdPartySharing: false,
    biometricAuth: false,
    twoFactorAuth: false
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const privacyCategories = [
    {
      title: 'Profile & Visibility',
      items: [
        {
          key: 'locationSharing' as keyof typeof settings,
          label: 'Location Sharing',
          description: 'Share your location for job assignments',
          icon: 'location-on',
          required: true
        },
        {
          key: 'profileVisibility' as keyof typeof settings,
          label: 'Profile Visibility',
          description: 'Make your profile visible to customers',
          icon: 'person'
        },
        {
          key: 'phoneNumberVisible' as keyof typeof settings,
          label: 'Phone Number Visibility',
          description: 'Show phone number to customers',
          icon: 'phone'
        }
      ]
    },
    {
      title: 'Data & Analytics',
      items: [
        {
          key: 'dataCollection' as keyof typeof settings,
          label: 'Data Collection',
          description: 'Allow app to collect usage data',
          icon: 'shield'
        },
        {
          key: 'analyticsSharing' as keyof typeof settings,
          label: 'Analytics Sharing',
          description: 'Share anonymous analytics data',
          icon: 'analytics'
        },
        {
          key: 'thirdPartySharing' as keyof typeof settings,
          label: 'Third-party Sharing',
          description: 'Share data with partner services',
          icon: 'share'
        }
      ]
    },
    {
      title: 'Security',
      items: [
        {
          key: 'biometricAuth' as keyof typeof settings,
          label: 'Biometric Authentication',
          description: 'Use fingerprint or face unlock',
          icon: 'fingerprint'
        },
        {
          key: 'twoFactorAuth' as keyof typeof settings,
          label: 'Two-Factor Authentication',
          description: 'Add extra security to your account',
          icon: 'security'
        }
      ]
    }
  ];

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This feature will be available soon.');
  };

  const handleDataDownload = () => {
    Alert.alert('Download Data', 'Your data download will be prepared and sent to your email.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Account Deleted', 'Your account has been scheduled for deletion.');
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Categories */}
        {privacyCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            
            {category.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <MaterialIcons name={item.icon as any} size={20} color="#28a745" />
                </View>
                
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                
                <Switch
                  value={settings[item.key]}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{ false: '#e0e0e0', true: '#28a745' }}
                  thumbColor={settings[item.key] ? '#fff' : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        ))}

        {/* Account Actions */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword}>
            <View style={[styles.settingIcon, { backgroundColor: '#e8f5e8' }]}>
              <MaterialIcons name="lock" size={20} color="#28a745" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.settingDescription}>Update your account password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleDataDownload}>
            <View style={[styles.settingIcon, { backgroundColor: '#e8f5e8' }]}>
              <MaterialIcons name="download" size={20} color="#28a745" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Download My Data</Text>
              <Text style={styles.settingDescription}>Get a copy of your data</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleDeleteAccount}>
            <View style={[styles.settingIcon, { backgroundColor: '#ffeaea' }]}>
              <MaterialIcons name="delete" size={20} color="#dc3545" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: '#dc3545' }]}>Delete Account</Text>
              <Text style={styles.settingDescription}>Permanently delete your account</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default PrivacyScreen;