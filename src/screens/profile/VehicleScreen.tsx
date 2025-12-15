import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Vehicle } from '../../types';

interface VehicleScreenProps {
  onBack: () => void;
}

const StatCard = ({ 
  iconName, 
  label, 
  value, 
  unit, 
  color 
}: { 
  iconName: string;
  label: string;
  value: string | number;
  unit: string;
  color: string;
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
      <MaterialIcons name={iconName as any} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statUnit}>{unit}</Text>
  </View>
);

const VehicleScreen = ({ onBack }: VehicleScreenProps) => {
  const [vehicle, setVehicle] = useState<Vehicle>({
    id: '1',
    vehicleNumber: 'KA 01 AB 1234',
    type: 'auto',
    capacity: 500,
    isOnline: true,
    currentLoad: 150,
  });

  const [settings, setSettings] = useState({
    autoAcceptBookings: false,
    locationTracking: true,
    notifications: true,
  });

  const handleToggleOnline = () => {
    setVehicle(prev => ({ ...prev, isOnline: !prev.isOnline }));
    Alert.alert(
      'Status Updated',
      `Vehicle is now ${!vehicle.isOnline ? 'online' : 'offline'}`
    );
  };

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'auto':
        return 'directions-car';
      case 'truck':
        return 'local-shipping';
      case 'van':
        return 'airport-shuttle';
      default:
        return 'directions-car';
    }
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? '#28a745' : '#dc3545';
  };

  const loadPercentage = (vehicle.currentLoad / vehicle.capacity) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.vehicleInfo}>
              <View style={[styles.vehicleIcon, { backgroundColor: `${getStatusColor(vehicle.isOnline)}20` }]}>
                <MaterialIcons 
                  name={getVehicleTypeIcon(vehicle.type)} 
                  size={32} 
                  color={getStatusColor(vehicle.isOnline)} 
                />
              </View>
              <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleNumber}>{vehicle.vehicleNumber}</Text>
                <Text style={styles.vehicleType}>
                  {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.statusButton,
                { backgroundColor: getStatusColor(vehicle.isOnline) }
              ]}
              onPress={handleToggleOnline}
            >
              <MaterialIcons 
                name={vehicle.isOnline ? 'power' : 'power-off'} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.statusButtonText}>
                {vehicle.isOnline ? 'Online' : 'Offline'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <StatCard
            iconName="speed"
            label="Capacity"
            value={vehicle.capacity}
            unit="kg"
            color="#007bff"
          />
          <StatCard
            iconName="inventory"
            label="Current Load"
            value={vehicle.currentLoad}
            unit="kg"
            color="#28a745"
          />
          <StatCard
            iconName="percent"
            label="Load %"
            value={Math.round(loadPercentage)}
            unit="%"
            color="#ffc107"
          />
          <StatCard
            iconName="check-circle"
            label="Status"
            value={vehicle.isOnline ? 'Active' : 'Inactive'}
            unit=""
            color={getStatusColor(vehicle.isOnline)}
          />
        </View>

        {/* Load Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Load Capacity</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(loadPercentage, 100)}%`,
                    backgroundColor: loadPercentage > 80 ? '#dc3545' : loadPercentage > 60 ? '#ffc107' : '#28a745'
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {vehicle.currentLoad}kg / {vehicle.capacity}kg
            </Text>
          </View>
        </View>

        {/* Vehicle Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Vehicle Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="auto-awesome" size={20} color="#28a745" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Auto Accept Bookings</Text>
                <Text style={styles.settingDescription}>Automatically accept nearby bookings</Text>
              </View>
            </View>
            <Switch
              value={settings.autoAcceptBookings}
              onValueChange={() => handleSettingToggle('autoAcceptBookings')}
              trackColor={{ false: '#e0e0e0', true: '#28a745' }}
              thumbColor={settings.autoAcceptBookings ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="location-on" size={20} color="#28a745" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Location Tracking</Text>
                <Text style={styles.settingDescription}>Share location for job assignments</Text>
              </View>
            </View>
            <Switch
              value={settings.locationTracking}
              onValueChange={() => handleSettingToggle('locationTracking')}
              trackColor={{ false: '#e0e0e0', true: '#28a745' }}
              thumbColor={settings.locationTracking ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="notifications" size={20} color="#28a745" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Receive booking notifications</Text>
              </View>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={() => handleSettingToggle('notifications')}
              trackColor={{ false: '#e0e0e0', true: '#28a745' }}
              thumbColor={settings.notifications ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="edit" size={20} color="#28a745" />
            <Text style={styles.actionButtonText}>Edit Vehicle Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="history" size={20} color="#28a745" />
            <Text style={styles.actionButtonText}>View Trip History</Text>
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
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  vehicleType: {
    fontSize: 14,
    color: '#666',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 10,
    color: '#999',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
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
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default VehicleScreen;