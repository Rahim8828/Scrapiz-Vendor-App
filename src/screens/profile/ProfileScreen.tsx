import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

const ProfileScreen = ({ onBack, onNavigate }: ProfileScreenProps) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout 
        }
      ]
    );
  };

  const profileCategories = [
    {
      title: "Account Management",
      color: "#1B7332",
      options: [
        { 
          icon: "person", 
          title: "Personal Information", 
          subtitle: "Name, phone, address", 
          action: "personal-info",
          badge: null 
        },
        { 
          icon: "account-balance-wallet", 
          title: "Payment Settings", 
          subtitle: "Bank details, UPI", 
          action: "payment-settings",
          badge: null 
        },
        { 
          icon: "language", 
          title: "Language", 
          subtitle: "हिंदी, English", 
          action: "language",
          badge: null 
        }
      ]
    },
    {
      title: "Support & Info",
      color: "#1B7332", 
      options: [
        { 
          icon: "help", 
          title: "Help & Support", 
          subtitle: "FAQ, contact us", 
          action: "help-support",
          badge: null 
        },
        { 
          icon: "info", 
          title: "About", 
          subtitle: "Version, terms", 
          action: "about",
          badge: null 
        }
      ]
    }
  ];

  const handleOptionPress = (action: string) => {
    try {
      if (typeof onNavigate === 'function' && action) {
        onNavigate(action);
      } else {
        console.error('Invalid navigation parameters:', { onNavigate: typeof onNavigate, action });
      }
    } catch (error) {
      console.error('Profile navigation error:', error);
    }
  };



  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Header Section */}
        <View style={styles.modernHeader}>
          <View style={styles.headerGradient}>
            {/* Navigation Bar */}
            <View style={styles.navBar}>
              <TouchableOpacity onPress={onBack} style={styles.modernBackButton}>
                <Ionicons name="arrow-back" size={22} color="white" />
              </TouchableOpacity>
              
              <View style={styles.navTitleContainer}>
                <MaterialIcons name="account-circle" size={20} color="white" />
                <Text style={styles.modernHeaderTitle}>My Profile</Text>
              </View>
              
              <TouchableOpacity style={styles.editButton} onPress={() => handleOptionPress('edit-profile')}>
                <MaterialIcons name="edit" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Enhanced Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarSection}>
                <View style={styles.modernAvatar}>
                  <MaterialIcons name="person" size={24} color="white" />
                  <TouchableOpacity style={styles.cameraButton}>
                    <MaterialIcons name="camera-alt" size={12} color="#1B7332" />
                  </TouchableOpacity>
                </View>

              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.modernUserName}>{user?.name || 'Vendor Name'}</Text>
                <Text style={styles.modernUserPhone}>{user?.phone || '+91 98765 43210'}</Text>
                <View style={styles.verificationBadge}>
                  <MaterialIcons name="verified" size={14} color="#1B7332" />
                  <Text style={styles.verifiedText}>Verified Vendor</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>


          {/* Categorized Profile Options */}
          {profileCategories.map((category, categoryIndex) => (
            <View key={categoryIndex} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIndicator, { backgroundColor: category.color }]} />
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>
              <View style={styles.categoryOptionsContainer}>
                {category.options.map((option) => (
                  <TouchableOpacity
                    key={option.action}
                    style={styles.modernOptionCard}
                    onPress={() => handleOptionPress(option.action)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modernOptionContent}>
                      <View style={[styles.modernOptionIcon, { backgroundColor: category.color + '15' }]}>
                        <MaterialIcons name={option.icon as any} size={22} color={category.color} />
                      </View>
                      <View style={styles.modernOptionTextContainer}>
                        <View style={styles.optionHeader}>
                          <Text style={styles.modernOptionTitle}>{option.title}</Text>
                          {option.badge && (
                            <View style={[styles.optionBadge, { backgroundColor: category.color + '20' }]}>
                              <Text style={[styles.badgeText, { color: category.color }]}>{option.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.modernOptionSubtitle}>{option.subtitle}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color="#bdc3c7" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}



          {/* Security Section */}
          <View style={styles.securitySection}>
            <View style={styles.securityOptions}>
              <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
                <View style={styles.logoutOptionIcon}>
                  <MaterialIcons name="logout" size={20} color="#dc3545" />
                </View>
                <Text style={styles.logoutOptionText}>Sign Out</Text>
                <MaterialIcons name="chevron-right" size={20} color="#dc3545" />
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
    paddingBottom: 160, // Increased for proper scrolling clearance with bottom navigation
  },
  header: {
    backgroundColor: '#1B7332',
    paddingHorizontal: 20,
    paddingTop: 44, // Safe area for status bar
    paddingBottom: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Reduced from 24
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
  profileInfo: {
    paddingHorizontal: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 15,
    color: '#E8F5E8',
    fontWeight: '500',
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
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 10, // Reduced from 12
    padding: 12, // Reduced from 16
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    minHeight: 64, // Reduced from 72
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionIcon: {
    width: 40, // Reduced from 48
    height: 40, // Reduced from 48
    backgroundColor: '#E8F5E8',
    borderRadius: 10, // Reduced from 12
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15, // Reduced from 16
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13, // Reduced from 14
    color: '#6c757d',
  },

  logoutButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Enhanced Header Styles
  modernHeader: {
    backgroundColor: '#1B7332',
    paddingTop: 44,
    paddingBottom: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  headerGradient: {
    paddingHorizontal: 20,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modernBackButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  modernHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  editButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  avatarSection: {
    alignItems: 'center',
  },
  modernAvatar: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  userDetails: {
    flex: 1,
  },
  modernUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 3,
  },
  modernUserPhone: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 3,
  },
  verifiedText: {
    fontSize: 10,
    color: '#1B7332',
    fontWeight: '600',
  },



  // Category Styles
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryOptionsContainer: {
    gap: 8,
  },
  modernOptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  modernOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modernOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernOptionTextContainer: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modernOptionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  optionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  modernOptionSubtitle: {
    fontSize: 13,
    color: '#6c757d',
  },

  // Security Section Styles
  securitySection: {
    marginBottom: 24,
  },
  securityOptions: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    gap: 12,
  },
  securityOptionIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#f8f9fa',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  logoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  logoutOptionIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#fef2f2',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#dc3545',
    fontWeight: '600',
  },
});

export default ProfileScreen;