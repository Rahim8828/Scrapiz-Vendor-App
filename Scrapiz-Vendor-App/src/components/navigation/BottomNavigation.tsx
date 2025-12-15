import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  jobCounts?: {
    active: number;
    pending: number;
    upcoming: number;
  };
}

const BottomNavigation = ({ activeTab, onTabChange, jobCounts }: BottomNavigationProps) => {
  const tabs = [
    { key: 'home', label: 'Home', icon: 'home' },
    { 
      key: 'ongoing', 
      label: 'Manage', 
      icon: 'work',
      badge: (jobCounts?.active || 0) + (jobCounts?.pending || 0)
    },
    { key: 'earnings', label: 'Target', icon: 'trending-up' },
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
              <View style={styles.iconContainer}>
                <MaterialIcons 
                  name={tab.icon as any} 
                  size={22} 
                  color={isActive ? '#1B7332' : '#6c757d'} 
                />
                {tab.badge && tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.label,
                isActive && styles.activeLabel
              ]}>
                {tab.label}
              </Text>
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
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#1B7332',
  },
});

export default BottomNavigation;