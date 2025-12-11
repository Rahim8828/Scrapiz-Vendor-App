import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: 'check-circle',
    barColor: '#28a745',
    textColor: '#155724',
    bgColor: '#d4edda',
    iconColor: '#28a745',
  },
  error: {
    icon: 'error',
    barColor: '#dc3545',
    textColor: '#721c24',
    bgColor: '#f8d7da',
    iconColor: '#dc3545',
  },
  info: {
    icon: 'info',
    barColor: '#007bff',
    textColor: '#004085',
    bgColor: '#d1ecf1',
    iconColor: '#007bff',
  },
};

const Toast = ({ message, type, isVisible, onClose, duration = 4000 }: ToastProps) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => onClose());
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const config = toastConfig[type];

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          backgroundColor: config.bgColor,
        }
      ]}
    >
      <View style={[styles.bar, { backgroundColor: config.barColor }]} />
      
      <View style={styles.iconContainer}>
        <MaterialIcons 
          name={config.icon as any} 
          size={24} 
          color={config.iconColor} 
        />
      </View>
      
      <View style={styles.messageContainer}>
        <Text style={[styles.message, { color: config.textColor }]}>
          {message}
        </Text>
      </View>
      
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <MaterialIcons name="close" size={20} color={config.textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  iconContainer: {
    marginLeft: 8,
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default Toast;