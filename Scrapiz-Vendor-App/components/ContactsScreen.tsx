import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Contact {
  id: string;
  name: string;
  phone: string;
  type: 'customer' | 'supervisor' | 'partner';
  lastContact: Date;
}

interface ContactsScreenProps {
  onBack: () => void;
}

const ContactsScreen = ({ onBack }: ContactsScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      type: 'customer',
      lastContact: new Date(Date.now() - 86400000),
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      phone: '+91 87654 32109',
      type: 'customer',
      lastContact: new Date(Date.now() - 172800000),
    },
    {
      id: '3',
      name: 'Supervisor - Mumbai Zone',
      phone: '+91 76543 21098',
      type: 'supervisor',
      lastContact: new Date(Date.now() - 3600000)
    },
  ]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const getContactIcon = (type: Contact['type']) => {
    switch (type) {
      case 'customer':
        return 'person';
      case 'supervisor':
        return 'supervisor-account';
      case 'partner':
        return 'business';
      default:
        return 'person';
    }
  };

  const formatLastContact = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or number..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Contacts List */}
        <ScrollView style={styles.contactsList}>
          {filteredContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <MaterialIcons name={getContactIcon(contact.type) as any} size={24} color="#28a745" />
              </View>
              
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
                <Text style={styles.lastContact}>
                  Last contact: {formatLastContact(contact.lastContact)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(contact.phone)}
              >
                <MaterialIcons name="phone" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {filteredContacts.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="contacts" size={48} color="#6c757d" />
            <Text style={styles.emptyTitle}>No Contacts Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? `No contacts match "${searchQuery}"` 
                : 'Your contacts will appear here'
              }
            </Text>
          </View>
        )}
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
    backgroundColor: '#28a745',
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
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  contactsList: {
    flex: 1,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#E8F5E8',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  lastContact: {
    fontSize: 12,
    color: '#6c757d',
  },
  callButton: {
    width: 40,
    height: 40,
    backgroundColor: '#28a745',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default ContactsScreen;