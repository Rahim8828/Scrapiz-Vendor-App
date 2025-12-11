import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  onBack: () => void;
  rightElement?: React.ReactNode;
  isTransparent?: boolean;
  textColor?: string;
}

const Header = ({ title, onBack, rightElement, isTransparent, textColor }: HeaderProps) => {
  return (
    <View style={[
      styles.header,
      isTransparent && styles.transparentHeader
    ]}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
      >
        <MaterialIcons 
          name="arrow-back" 
          size={24} 
          color={textColor || '#333'} 
        />
      </TouchableOpacity>
      
      <Text style={[
        styles.title,
        { color: textColor || '#333' }
      ]}>
        {title}
      </Text>
      
      <View style={styles.rightContainer}>
        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  transparentHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
});

export default Header;