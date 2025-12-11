import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Material } from '../../types';

interface MaterialsScreenProps {
  onBack: () => void;
}

const materialsData: (Material & { iconName: string, color: string, trend: 'up' | 'down' | 'stable' })[] = [
  { id: '1', name: 'Iron', category: 'Metals', currentRate: 25, unit: 'kg', iconName: 'build', color: '#95a5a6', trend: 'up' },
  { id: '2', name: 'Aluminum', category: 'Metals', currentRate: 120, unit: 'kg', iconName: 'build', color: '#95a5a6', trend: 'stable' },
  { id: '3', name: 'Copper', category: 'Metals', currentRate: 450, unit: 'kg', iconName: 'build', color: '#95a5a6', trend: 'up' },
  { id: '4', name: 'Brass', category: 'Metals', currentRate: 280, unit: 'kg', iconName: 'build', color: '#95a5a6', trend: 'down' },
  { id: '5', name: 'Paper', category: 'Paper', currentRate: 12, unit: 'kg', iconName: 'description', color: '#3498db', trend: 'up' },
  { id: '6', name: 'Cardboard', category: 'Paper', currentRate: 8, unit: 'kg', iconName: 'inventory', color: '#795548', trend: 'stable' },
  { id: '7', name: 'Plastic Bottles', category: 'Plastics', currentRate: 18, unit: 'kg', iconName: 'recycling', color: '#2ecc71', trend: 'up' },
  { id: '8', name: 'Electronics', category: 'E-Waste', currentRate: 35, unit: 'kg', iconName: 'computer', color: '#f1c40f', trend: 'down' },
];

const categories = ['All', 'Metals', 'Paper', 'Plastics', 'E-Waste'];

const MaterialsScreen = ({ onBack }: MaterialsScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredMaterials = materialsData.filter(material => {
    const categoryMatch = activeCategory === 'All' || material.category === activeCategory;
    const searchMatch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'trending-flat';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '#28a745';
      case 'down':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Material Rates</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search materials..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              activeCategory === category && styles.activeCategoryButton
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === category && styles.activeCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Materials List */}
      <ScrollView style={styles.materialsContainer} showsVerticalScrollIndicator={false}>
        {filteredMaterials.map((material) => (
          <View key={material.id} style={styles.materialCard}>
            <View style={styles.materialHeader}>
              <View style={[styles.materialIcon, { backgroundColor: `${material.color}20` }]}>
                <MaterialIcons 
                  name={material.iconName as any} 
                  size={24} 
                  color={material.color} 
                />
              </View>
              
              <View style={styles.materialInfo}>
                <Text style={styles.materialName}>{material.name}</Text>
                <Text style={styles.materialCategory}>{material.category}</Text>
              </View>
              
              <View style={styles.trendContainer}>
                <MaterialIcons 
                  name={getTrendIcon(material.trend) as any} 
                  size={20} 
                  color={getTrendColor(material.trend)} 
                />
              </View>
            </View>
            
            <View style={styles.materialFooter}>
              <View style={styles.rateContainer}>
                <Text style={styles.rateLabel}>Current Rate</Text>
                <Text style={styles.rateValue}>₹{material.currentRate}/{material.unit}</Text>
              </View>
              
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>View Details</Text>
                <MaterialIcons name="chevron-right" size={16} color="#28a745" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {filteredMaterials.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No materials found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
          </View>
        )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeCategoryButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
  },
  materialsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  materialCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  materialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  materialCategory: {
    fontSize: 14,
    color: '#666',
  },
  trendContainer: {
    padding: 4,
  },
  materialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateContainer: {
    flex: 1,
  },
  rateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#e8f5e8',
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default MaterialsScreen;