import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

interface EditProfileScreenProps {
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const EditProfileScreen = ({ onBack, onShowToast }: EditProfileScreenProps) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Nooroolhuda',
    phone: user?.phone || '+91 9967332092',
    email: 'nooroolhuda@example.com',
    address: 'Mumbai, Maharashtra',
    vehicleNumber: 'MH01DM8286',
    emergencyContact: '+91 9876543210'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Basic validation
    if (!profileData.name.trim()) {
      onShowToast('Name is required', 'error');
      return;
    }
    
    if (!profileData.phone.trim()) {
      onShowToast('Phone number is required', 'error');
      return;
    }
    
    if (profileData.phone.length < 10) {
      onShowToast('Please enter a valid phone number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to save profile data
      await new Promise(resolve => setTimeout(resolve, 1500));
      onShowToast('Profile updated successfully!', 'success');
      onBack(); // Go back after successful save
    } catch (error) {
      onShowToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = () => {
    // This would typically open the device's file picker
    onShowToast('Photo upload feature is for demonstration!', 'info');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Photo Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={40} color="white" />
            </View>
            <TouchableOpacity style={styles.cameraButton} onPress={handlePhotoUpload}>
              <MaterialIcons name="camera-alt" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profileData.name}</Text>
          <Text style={styles.profileRole}>Scrapiz Vendor</Text>
        </View>

        {/* Form Sections */}
        <View style={styles.formSection}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="person" size={20} color="#1B7332" />
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.name}
                onChangeText={(text) => setProfileData({...profileData, name: text})}
                placeholder="Your full name"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.email}
                onChangeText={(text) => setProfileData({...profileData, email: text})}
                placeholder="Your email address"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.phone}
                onChangeText={(text) => setProfileData({...profileData, phone: text})}
                placeholder="Your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="work" size={20} color="#1B7332" />
              <Text style={styles.cardTitle}>Work Information</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Vehicle Number</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.vehicleNumber}
                onChangeText={(text) => setProfileData({...profileData, vehicleNumber: text})}
                placeholder="e.g., MH 01 AB 1234"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Primary Address</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.address}
                onChangeText={(text) => setProfileData({...profileData, address: text})}
                placeholder="Your primary operating address"
                multiline
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="security" size={20} color="#1B7332" />
              <Text style={styles.cardTitle}>Security</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Emergency Contact</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.emergencyContact}
                onChangeText={(text) => setProfileData({...profileData, emergencyContact: text})}
                placeholder="An emergency contact number"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Save Button */}
      <View style={styles.floatingButton}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <MaterialIcons name="hourglass-empty" size={20} color="white" />
          ) : (
            <MaterialIcons name="save" size={20} color="white" />
          )}
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#1B7332',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#1B7332',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    backgroundColor: '#1B7332',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#6c757d',
  },
  formSection: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#1B7332',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;