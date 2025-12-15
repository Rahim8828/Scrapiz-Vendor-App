import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MoreMenuScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

interface MenuItem {
  iconName: string;
  title: string;
  subtitle: string;
  action: () => void;
  color?: string;
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <TouchableOpacity
      style={styles.menuCard}
      onPress={item.action}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color || '#28a745'}20` }]}>
        <MaterialIcons 
          name={item.iconName as any} 
          size={28} 
          color={item.color || '#28a745'} 
        />
      </View>
      <Text style={styles.menuTitle}>{item.title}</Text>
      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function MoreMenuScreen({ onBack, onNavigate }: MoreMenuScreenProps) {
  const menuItems: MenuItem[] = [
    {
      iconName: 'event',
      title: 'Future Requests',
      subtitle: 'Scheduled jobs',
      action: () => onNavigate('future-requests'),
      color: '#007bff',
    },
    {
      iconName: 'inventory',
      title: 'Materials',
      subtitle: 'Scrap rates',
      action: () => onNavigate('materials'),
      color: '#28a745',
    },
    {
      iconName: 'phone',
      title: 'Contacts',
      subtitle: 'Customer contacts',
      action: () => onNavigate('contacts'),
      color: '#17a2b8',
    },
    {
      iconName: 'account-balance-wallet',
      title: 'Payment Settings',
      subtitle: 'Bank & payment',
      action: () => onNavigate('payment-settings'),
      color: '#ffc107',
    },
    {
      iconName: 'local-shipping',
      title: 'Vehicle Details',
      subtitle: 'Manage vehicle',
      action: () => onNavigate('vehicle'),
      color: '#6f42c1',
    },
    {
      iconName: 'settings',
      title: 'App Settings',
      subtitle: 'Preferences',
      action: () => onNavigate('app-settings'),
      color: '#6c757d',
    },
    {
      iconName: 'description',
      title: 'Reports',
      subtitle: 'Earnings & stats',
      action: () => onNavigate('reports'),
      color: '#fd7e14',
    },
    {
      iconName: 'help',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      action: () => onNavigate('help-support'),
      color: '#20c997',
    },
  ];

  const accountItems: MenuItem[] = [
    {
      iconName: 'person',
      title: 'Profile Settings',
      subtitle: 'Edit your profile',
      action: () => onNavigate('profile'),
      color: '#28a745',
    },
    {
      iconName: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage alerts',
      action: () => onNavigate('notifications'),
      color: '#007bff',
    },
    {
      iconName: 'privacy-tip',
      title: 'Privacy',
      subtitle: 'Privacy settings',
      action: () => onNavigate('privacy'),
      color: '#dc3545',
    },
    {
      iconName: 'logout',
      title: 'Sign Out',
      subtitle: 'Logout from app',
      action: () => {
        // Handle logout
      },
      color: '#dc3545',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>More Options</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <MenuCard key={index} item={item} />
            ))}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.accountList}>
            {accountItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.accountItem}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.accountItemLeft}>
                  <View style={[styles.accountIcon, { backgroundColor: `${item.color}20` }]}>
                    <MaterialIcons 
                      name={item.iconName as any} 
                      size={20} 
                      color={item.color} 
                    />
                  </View>
                  <View style={styles.accountText}>
                    <Text style={styles.accountTitle}>{item.title}</Text>
                    <Text style={styles.accountSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Scrapiz Vendor App</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  accountList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountText: {
    flex: 1,
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  accountSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
  },
});