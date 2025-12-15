import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface VehicleDetailsScreenProps {
  onBack: () => void;
}

const VehicleDetailsScreen = ({ onBack }: VehicleDetailsScreenProps) => {
  const [vehicleStatus, setVehicleStatus] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const vehicles = [
    {
      id: '1',
      type: 'Auto Rickshaw',
      number: 'KA 01 AB 1234',
      capacity: '500 kg',
      fuelType: 'Petrol',
      insurance: 'Valid till Dec 2024',
      permit: 'Valid till Mar 2025',
      icon: 'directions-car',
    },
    {
      id: '2',
      type: 'Mini Truck',
      number: 'KA 02 CD 5678',
      capacity: '1000 kg',
      fuelType: 'Diesel',
      insurance: 'Valid till Jan 2025',
      permit: 'Valid till Jun 2025',
      icon: 'local-shipping',
    },
  ];

  const handleStatusToggle = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVehicleStatus(!vehicleStatus);
      Alert.alert(
        'Status Updated',
        `Vehicle is now ${!vehicleStatus ? 'Online' : 'Offline'}`
      );
    } catch {
      Alert.alert('Error', 'Failed to update vehicle status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = () => {
    Alert.alert('Add Vehicle', 'Vehicle registration feature coming soon!');
  };

  const VehicleCard = ({ vehicle, index, isSelected }: {
    vehicle: typeof vehicles[0];
    index: number;
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.vehicleCard, isSelected && styles.selectedVehicleCard]}
      onPress={() => setSelectedVehicle(index)}
    >
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleIconContainer}>
          <MaterialIcons name={vehicle.icon as any} size={32} color="#28a745" />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleType}>{vehicle.type}</Text>
          <Text style={styles.vehicleNumber}>{vehicle.number}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <MaterialIcons name="check-circle" size={24} color="#28a745" />
          </View>
        )}
      </View>
      
      <View style={styles.vehicleDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="fitness-center" size={16} color="#6c757d" />
          <Text style={styles.detailText}>Capacity: {vehicle.capacity}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="local-gas-station" size={16} color="#6c757d" />
          <Text style={styles.detailText}>Fuel: {vehicle.fuelType}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="security" size={16} color="#6c757d" />
          <Text style={styles.detailText}>Insurance: {vehicle.insurance}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="description" size={16} color="#6c757d" />
          <Text style={styles.detailText}>Permit: {vehicle.permit}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerNav}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Vehicle Details</Text>
            
            <TouchableOpacity onPress={handleAddVehicle} style={styles.addButton}>
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Vehicle Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusInfo}>
                <View style={styles.statusIconContainer}>
                  <MaterialIcons 
                    name={vehicleStatus ? "directions-car" : "no-crash"} 
                    size={32} 
                    color={vehicleStatus ? "#28a745" : "#6c757d"} 
                  />
                </View>
                <View>
                  <Text style={styles.statusTitle}>
                    {vehicleStatus ? 'Vehicle Online' : 'Vehicle Offline'}
                  </Text>
                  <Text style={styles.statusSubtitle}>
                    {vehicleStatus ? 'Ready to accept bookings' : 'Not accepting bookings'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.statusToggle, 
                  vehicleStatus && styles.statusToggleActive,
                  isLoading && styles.statusToggleDisabled
                ]}
                onPress={handleStatusToggle}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <MaterialIcons name="hourglass-empty" size={16} color="white" />
                    <Text style={[styles.statusToggleText, vehicleStatus && styles.statusToggleTextActive]}>
                      Updating...
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.statusToggleText, vehicleStatus && styles.statusToggleTextActive]}>
                    {vehicleStatus ? 'Go Offline' : 'Go Online'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* My Vehicles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Vehicles ({vehicles.length})</Text>
            <View style={styles.vehiclesContainer}>
              {vehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={index}
                  isSelected={selectedVehicle === index}
                />
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="build" size={24} color="#28a745" />
                <Text style={styles.actionButtonText}>Maintenance</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="local-gas-station" size={24} color="#28a745" />
                <Text style={styles.actionButtonText}>Fuel Log</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="description" size={24} color="#28a745" />
                <Text style={styles.actionButtonText}>Documents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="history" size={24} color="#28a745" />
                <Text style={styles.actionButtonText}>Trip History</Text>
              </TouchableOpacity>
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
  addButton: {
    padding: 8,
    borderRadius: 8,
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
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIconContainer: {
    marginRight: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusToggle: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  statusToggleActive: {
    backgroundColor: '#dc3545',
  },
  statusToggleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusToggleTextActive: {
    color: 'white',
  },
  statusToggleDisabled: {
    backgroundColor: '#adb5bd',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehiclesContainer: {
    gap: 16,
  },
  vehicleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedVehicleCard: {
    borderColor: '#28a745',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
  },
  selectedBadge: {
    marginLeft: 12,
  },
  vehicleDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6c757d',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%', // Exactly 2 per row with gap
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    gap: 8,
    minHeight: 80, // Better touch target
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default VehicleDetailsScreen;