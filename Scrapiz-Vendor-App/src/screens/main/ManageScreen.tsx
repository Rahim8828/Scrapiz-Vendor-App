import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ManageScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

const manageOptions = [
  {
    icon: "work",
    title: "Active Jobs",
    action: "active-jobs"
  },
  {
    icon: "calendar-today",
    title: "Schedule",
    action: "future-requests"
  },
  {
    icon: "trending-up",
    title: "Earnings Report",
    action: "earnings"
  },
  {
    icon: "history",
    title: "Job History",
    action: "history"
  }
];

const ManageScreen = ({ onBack, onNavigate }: ManageScreenProps) => {
  const handleOptionPress = (action: string) => {
    try {
      if (typeof onNavigate === 'function' && action) {
        onNavigate(action);
      } else {
        console.error('Invalid navigation parameters');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Simple Options List */}
          <View style={styles.optionsContainer}>
            {manageOptions.map((option) => (
              <TouchableOpacity
                key={option.action}
                style={styles.optionCard}
                onPress={() => handleOptionPress(option.action)}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <MaterialIcons name={option.icon as any} size={24} color="#1B7332" />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <MaterialIcons name="chevron-right" size={20} color="#bdc3c7" />
              </TouchableOpacity>
            ))}
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
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
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
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
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
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
});

export default ManageScreen;
