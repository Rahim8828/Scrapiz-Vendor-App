import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'earnings', label: 'Earnings', icon: 'currency-rupee' },
    { key: 'manage', label: 'Manage', icon: 'work' },
    { key: 'profile', label: 'Profile', icon: 'person' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              style={[
                styles.tab,
                isActive && styles.activeTab
              ]}
            >
              <MaterialIcons 
                name={tab.icon as any} 
                size={20} 
                color={isActive ? '#28a745' : '#6c757d'} 
                style={{ marginBottom: 4 }}
              />
              <Text style={[
                styles.label,
                isActive && styles.activeLabel
              ]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: 20, // Safe area for iOS
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f0f9f0',
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeLabel: {
    color: '#28a745',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -16,
    width: 32,
    height: 3,
    backgroundColor: '#28a745',
    borderRadius: 2,
  },
});

export default BottomNavigation;