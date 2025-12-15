import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface VehicleStatusScreenProps {
  onBack: () => void;
}

interface VehicleInfo {
  id: string;
  type: string;
  model: string;
  registrationNumber: string;
  capacity: string;
  currentLoad: string;
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenance: string;
  status: 'active' | 'maintenance' | 'inactive';
  location: string;
  odometer: string;
}

const vehicleData: VehicleInfo = {
  id: 'VEH001',
  type: 'Pickup Truck',
  model: 'Tata Ace Gold',
  registrationNumber: 'KA 05 MN 1234',
  capacity: '750 kg',
  currentLoad: '320 kg',
  fuelLevel: 75,
  lastMaintenance: '2024-11-15',
  nextMaintenance: '2024-12-15',
  status: 'active',
  location: 'Koramangala, Bangalore',
  odometer: '45,230 km'
};

const VehicleStatusScreen = ({ onBack }: VehicleStatusScreenProps) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleUpdateLocation = () => {
    Alert.alert(
      'Update Location',
      'Your current location will be updated automatically.',
      [{ text: 'OK' }]
    );
  };

  const handleScheduleMaintenance = () => {
    Alert.alert(
      'Schedule Maintenance',
      'Would you like to schedule maintenance for your vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Schedule', 
          onPress: () => Alert.alert('Success', 'Maintenance scheduled successfully!')
        }
      ]
    );
  };

  const handleEmergencySupport = () => {
    Alert.alert(
      'Emergency Support',
      'Do you need immediate roadside assistance?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Support', 
          onPress: () => Alert.alert('Calling', 'Connecting to emergency support...')
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'maintenance': return '#ffc107';
      case 'inactive': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getLoadPercentage = () => {
    const current = parseInt(vehicleData.currentLoad);
    const capacity = parseInt(vehicleData.capacity);
    return (current / capacity) * 100;
  };

  const getFuelColor = (level: number) => {
    if (level > 50) return '#28a745';
    if (level > 25) return '#ffc107';
    return '#dc3545';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vehicle</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Vehicle Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.vehicleHeader}>
            <View style={styles.vehicleIcon}>
              <MaterialIcons name="local-shipping" size={32} color="#28a745" />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleModel}>{vehicleData.model}</Text>
              <Text style={styles.vehicleReg}>{vehicleData.registrationNumber}</Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(vehicleData.status) }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(vehicleData.status) }
                ]}>
                  {vehicleData.status.charAt(0).toUpperCase() + vehicleData.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Controls */}
        <View style={styles.controlsCard}>
          <Text style={styles.sectionTitle}>Quick Controls</Text>
          
          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <MaterialIcons name="visibility" size={20} color="#6c757d" />
              <Text style={styles.controlLabel}>Available for Jobs</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#E0E0E0', true: '#28a745' }}
              thumbColor={isAvailable ? 'white' : '#f4f3f4'}
            />
          </View>

          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <MaterialIcons name="build" size={20} color="#6c757d" />
              <Text style={styles.controlLabel}>Maintenance Mode</Text>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenanceMode}
              trackColor={{ false: '#E0E0E0', true: '#ffc107' }}
              thumbColor={maintenanceMode ? 'white' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity onPress={handleUpdateLocation} style={styles.controlButton}>
            <MaterialIcons name="my-location" size={20} color="#28a745" />
            <Text style={styles.controlButtonText}>Update Current Location</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#6c757d" />
          </TouchableOpacity>
        </View>

        {/* Vehicle Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Vehicle Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialIcons name="speed" size={24} color="#28a745" />
              <Text style={styles.statValue}>{vehicleData.odometer}</Text>
              <Text style={styles.statLabel}>Total Distance</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialIcons name="location-on" size={24} color="#28a745" />
              <Text style={styles.statValue}>Live</Text>
              <Text style={styles.statLabel}>GPS Tracking</Text>
            </View>
          </View>

          <View style={styles.locationInfo}>
            <MaterialIcons name="place" size={16} color="#6c757d" />
            <Text style={styles.locationText}>Current Location: {vehicleData.location}</Text>
          </View>
        </View>

        {/* Load & Fuel Status */}
        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Load & Fuel Status</Text>
          
          {/* Load Status */}
          <View style={styles.statusItem}>
            <View style={styles.statusHeader}>
              <MaterialIcons name="scale" size={20} color="#6c757d" />
              <Text style={styles.statusItemTitle}>Current Load</Text>
              <Text style={styles.statusValue}>
                {vehicleData.currentLoad} / {vehicleData.capacity}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${getLoadPercentage()}%`,
                    backgroundColor: getLoadPercentage() > 80 ? '#dc3545' : '#28a745'
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {getLoadPercentage().toFixed(0)}% capacity used
            </Text>
          </View>

          {/* Fuel Status */}
          <View style={styles.statusItem}>
            <View style={styles.statusHeader}>
              <MaterialIcons name="local-gas-station" size={20} color="#6c757d" />
              <Text style={styles.statusItemTitle}>Fuel Level</Text>
              <Text style={styles.statusValue}>{vehicleData.fuelLevel}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${vehicleData.fuelLevel}%`,
                    backgroundColor: getFuelColor(vehicleData.fuelLevel)
                  }
                ]} 
              />
            </View>
            <Text style={[
              styles.progressText,
              { color: getFuelColor(vehicleData.fuelLevel) }
            ]}>
              {vehicleData.fuelLevel < 25 ? 'Low fuel - Refuel soon' : 'Fuel level good'}
            </Text>
          </View>
        </View>

        {/* Maintenance Info */}
        <View style={styles.maintenanceCard}>
          <Text style={styles.sectionTitle}>Maintenance Schedule</Text>
          
          <View style={styles.maintenanceItem}>
            <View style={styles.maintenanceIcon}>
              <MaterialIcons name="check-circle" size={20} color="#28a745" />
            </View>
            <View style={styles.maintenanceInfo}>
              <Text style={styles.maintenanceTitle}>Last Service</Text>
              <Text style={styles.maintenanceDate}>
                {new Date(vehicleData.lastMaintenance).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.maintenanceItem}>
            <View style={styles.maintenanceIcon}>
              <MaterialIcons name="schedule" size={20} color="#ffc107" />
            </View>
            <View style={styles.maintenanceInfo}>
              <Text style={styles.maintenanceTitle}>Next Service Due</Text>
              <Text style={styles.maintenanceDate}>
                {new Date(vehicleData.nextMaintenance).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleScheduleMaintenance}
            style={styles.maintenanceButton}
          >
            <MaterialIcons name="build" size={20} color="white" />
            <Text style={styles.maintenanceButtonText}>Schedule Maintenance</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Support */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <MaterialIcons name="warning" size={24} color="#dc3545" />
            <Text style={styles.emergencyTitle}>Emergency Support</Text>
          </View>
          <Text style={styles.emergencySubtitle}>
            Need immediate roadside assistance or have a vehicle emergency?
          </Text>
          <TouchableOpacity 
            onPress={handleEmergencySupport}
            style={styles.emergencyButton}
          >
            <MaterialIcons name="phone" size={20} color="white" />
            <Text style={styles.emergencyButtonText}>Call Emergency Support</Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: '#28a745',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  overviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  vehicleIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#E8F5E8',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vehicleReg: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  controlInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  controlLabel: {
    fontSize: 16,
    color: '#333',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingTop: 16,
  },
  controlButtonText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statusItem: {
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusItemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
  },
  maintenanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  maintenanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  maintenanceIcon: {
    marginRight: 12,
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  maintenanceDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  maintenanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  maintenanceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VehicleStatusScreen;