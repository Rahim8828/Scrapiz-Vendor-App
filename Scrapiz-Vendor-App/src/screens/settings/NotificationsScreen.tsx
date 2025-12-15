import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface NotificationsScreenProps {
  onBack: () => void;
}

const NotificationsScreen = ({ onBack }: NotificationsScreenProps) => {
  const [settings, setSettings] = useState({
    newBookings: true,
    paymentUpdates: true,
    promotions: false,
    systemUpdates: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Booking Request',
      message: 'You have a new scrap pickup request from Priya Sharma',
      time: '2 minutes ago',
      type: 'booking',
      isRead: false,
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of ₹450 received for Job #12345',
      time: '1 hour ago',
      type: 'payment',
      isRead: true,
    },
    {
      id: '3',
      title: 'Weekly Earnings Summary',
      message: 'Your weekly earnings: ₹12,400. Great job!',
      time: '1 day ago',
      type: 'earnings',
      isRead: true,
    },
    {
      id: '4',
      title: 'App Update Available',
      message: 'New version 1.1.0 is available with bug fixes',
      time: '2 days ago',
      type: 'system',
      isRead: false,
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingToggle = async (key: string) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSettings(prev => ({
        ...prev,
        [key]: !prev[key as keyof typeof prev]
      }));
    } catch {
      Alert.alert('Error', 'Failed to update notification settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return 'work';
      case 'payment':
        return 'payment';
      case 'earnings':
        return 'trending-up';
      case 'system':
        return 'system-update';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return '#007bff';
      case 'payment':
        return '#28a745';
      case 'earnings':
        return '#ffc107';
      case 'system':
        return '#6c757d';
      default:
        return '#28a745';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerNav}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Notifications</Text>
            
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <View style={styles.content}>
          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            <View style={styles.settingsContainer}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="work" size={24} color="#28a745" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>New Bookings</Text>
                    <Text style={styles.settingSubtitle}>Get notified about new pickup requests</Text>
                  </View>
                </View>
                <Switch
                  value={settings.newBookings}
                  onValueChange={() => handleSettingToggle('newBookings')}
                  trackColor={{ false: '#e9ecef', true: '#28a745' }}
                  thumbColor={settings.newBookings ? '#ffffff' : '#6c757d'}
                  disabled={isSaving}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="payment" size={24} color="#28a745" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Payment Updates</Text>
                    <Text style={styles.settingSubtitle}>Notifications about payments and earnings</Text>
                  </View>
                </View>
                <Switch
                  value={settings.paymentUpdates}
                  onValueChange={() => handleSettingToggle('paymentUpdates')}
                  trackColor={{ false: '#e9ecef', true: '#28a745' }}
                  thumbColor={settings.paymentUpdates ? '#ffffff' : '#6c757d'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="local-offer" size={24} color="#28a745" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Promotions</Text>
                    <Text style={styles.settingSubtitle}>Special offers and promotional content</Text>
                  </View>
                </View>
                <Switch
                  value={settings.promotions}
                  onValueChange={() => handleSettingToggle('promotions')}
                  trackColor={{ false: '#e9ecef', true: '#28a745' }}
                  thumbColor={settings.promotions ? '#ffffff' : '#6c757d'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="system-update" size={24} color="#28a745" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>System Updates</Text>
                    <Text style={styles.settingSubtitle}>App updates and system notifications</Text>
                  </View>
                </View>
                <Switch
                  value={settings.systemUpdates}
                  onValueChange={() => handleSettingToggle('systemUpdates')}
                  trackColor={{ false: '#e9ecef', true: '#28a745' }}
                  thumbColor={settings.systemUpdates ? '#ffffff' : '#6c757d'}
                />
              </View>
            </View>
          </View>

          {/* Sound & Vibration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound & Vibration</Text>
            <View style={styles.settingsContainer}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="volume-up" size={24} color="#28a745" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Sound</Text>
                    <Text style={styles.settingSubtitle}>Play sound for notifications</Text>
                  </View>
                </View>
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={() => handleSettingToggle('soundEnabled')}
                  trackColor={{ false: '#e9ecef', true: '#28a745' }}
                  thumbColor={settings.soundEnabled ? '#ffffff' : '#6c757d'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="vibration" size={24} color="#28a745" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Vibration</Text>
                    <Text style={styles.settingSubtitle}>Vibrate for notifications</Text>
                  </View>
                </View>
                <Switch
                  value={settings.vibrationEnabled}
                  onValueChange={() => handleSettingToggle('vibrationEnabled')}
                  trackColor={{ false: '#e9ecef', true: '#28a745' }}
                  thumbColor={settings.vibrationEnabled ? '#ffffff' : '#6c757d'}
                />
              </View>
            </View>
          </View>

          {/* Recent Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <View style={styles.notificationsContainer}>
              {notifications.map((notification) => (
                <TouchableOpacity 
                  key={notification.id} 
                  style={[
                    styles.notificationCard,
                    !notification.isRead && styles.unreadNotification
                  ]}
                  onPress={() => handleMarkAsRead(notification.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationHeader}>
                    <View style={[
                      styles.notificationIcon,
                      { backgroundColor: `${getNotificationColor(notification.type)}20` }
                    ]}>
                      <MaterialIcons 
                        name={getNotificationIcon(notification.type) as any} 
                        size={20} 
                        color={getNotificationColor(notification.type)} 
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                    {!notification.isRead && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
    paddingBottom: 120, // Extra space for bottom navigation
  },
  header: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    padding: 16,
  },
  section: {
    marginBottom: 16, // Reduced from 24
  },
  sectionTitle: {
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12, // Reduced from 16
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60, // Better touch target
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  notificationsContainer: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 20,
    flexWrap: 'wrap', // Handle long text
  },
  notificationTime: {
    fontSize: 12,
    color: '#adb5bd',
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#28a745',
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
});

export default NotificationsScreen;