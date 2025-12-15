import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';

interface PersonalInfoScreenProps {
  onBack: () => void;
}

const PersonalInfoScreen = ({ onBack }: PersonalInfoScreenProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Rajesh Kumar',
    phone: user?.phone || '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    address: '123 MG Road, Bangalore, Karnataka 560001',
    aadharNumber: '1234 5678 9012',
    panNumber: 'ABCDE1234F',
    licenseNumber: 'KA01 20230001234',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+91\s\d{5}\s\d{5}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }
    
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Personal information updated successfully!');
      setIsEditing(false);
      setErrors({});
    } catch {
      Alert.alert('Error', 'Failed to update information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      name: user?.name || 'Rajesh Kumar',
      phone: user?.phone || '+91 98765 43210',
      email: 'rajesh.kumar@email.com',
      address: '123 MG Road, Bangalore, Karnataka 560001',
      aadharNumber: '1234 5678 9012',
      panNumber: 'ABCDE1234F',
      licenseNumber: 'KA01 20230001234',
    });
  };

  const InfoField = ({ label, value, keyName, icon, editable = true, keyboardType = 'default' }: {
    label: string;
    value: string;
    keyName: string;
    icon: string;
    editable?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
  }) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <MaterialIcons name={icon as any} size={20} color="#1B7332" />
        <Text style={styles.fieldLabel}>{label}</Text>
        {errors[keyName] && (
          <MaterialIcons name="error" size={16} color="#dc3545" />
        )}
      </View>
      {isEditing && editable ? (
        <View>
          <TextInput
            style={[
              styles.textInput,
              errors[keyName] && styles.textInputError
            ]}
            value={value}
            onChangeText={(text) => {
              setFormData({ ...formData, [keyName]: text });
              if (errors[keyName]) {
                setErrors({ ...errors, [keyName]: '' });
              }
            }}
            placeholder={label}
            keyboardType={keyboardType}
            autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          />
          {errors[keyName] && (
            <Text style={styles.errorText}>{errors[keyName]}</Text>
          )}
        </View>
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
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
            
            <Text style={styles.headerTitle}>Personal Information</Text>
            
            <TouchableOpacity 
              onPress={() => setIsEditing(!isEditing)} 
              style={styles.editButton}
            >
              <MaterialIcons 
                name={isEditing ? "close" : "edit"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={32} color="white" />
              </View>
              {isEditing && (
                <TouchableOpacity style={styles.cameraButton}>
                  <MaterialIcons name="camera-alt" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.photoText}>Profile Photo</Text>
          </View>

          {/* Personal Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.fieldsContainer}>
              <InfoField
                label="Full Name"
                value={formData.name}
                keyName="name"
                icon="person"
              />
              <InfoField
                label="Phone Number"
                value={formData.phone}
                keyName="phone"
                icon="phone"
                keyboardType="phone-pad"
              />
              <InfoField
                label="Email Address"
                value={formData.email}
                keyName="email"
                icon="email"
                keyboardType="email-address"
              />
              <InfoField
                label="Address"
                value={formData.address}
                keyName="address"
                icon="location-on"
              />
            </View>
          </View>

          {/* Documents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <View style={styles.fieldsContainer}>
              <InfoField
                label="Aadhar Number"
                value={formData.aadharNumber}
                keyName="aadharNumber"
                icon="credit-card"
              />
              <InfoField
                label="PAN Number"
                value={formData.panNumber}
                keyName="panNumber"
                icon="account-balance-wallet"
              />
              <InfoField
                label="Driving License"
                value={formData.licenseNumber}
                keyName="licenseNumber"
                icon="drive-eta"
              />
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <View style={styles.savingContainer}>
                    <MaterialIcons name="hourglass-empty" size={16} color="white" />
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
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
    backgroundColor: '#1B7332',
    paddingHorizontal: 16,
    paddingTop: 44, // Safe area for status bar
    paddingBottom: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    padding: 16,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20, // Reduced from 32
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#1B7332',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  photoText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
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
  fieldsContainer: {
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
  fieldContainer: {
    gap: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12, // Better touch target
    backgroundColor: '#f8f9fa',
    minHeight: 44, // iOS minimum touch target
  },
  textInputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 4, // Prevent edge cutoff
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48, // Better touch target
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1B7332',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48, // Better touch target
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default PersonalInfoScreen;