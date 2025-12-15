import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e9ecef', '#f8f9fa'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Booking Card Skeleton
export const BookingCardSkeleton: React.FC = () => {
  return (
    <View style={styles.bookingCardSkeleton}>
      <View style={styles.skeletonPriorityStrip} />
      
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonLeft}>
          <SkeletonLoader width="70%" height={18} borderRadius={4} />
          <SkeletonLoader width="50%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
          <View style={styles.skeletonMetrics}>
            <SkeletonLoader width={60} height={12} borderRadius={6} />
            <SkeletonLoader width={50} height={12} borderRadius={6} />
          </View>
        </View>
        
        <View style={styles.skeletonRight}>
          <SkeletonLoader width={80} height={24} borderRadius={6} />
          <SkeletonLoader width={60} height={16} borderRadius={8} style={{ marginTop: 8 }} />
        </View>
      </View>
      
      <View style={styles.skeletonActionBar}>
        <SkeletonLoader width={44} height={44} borderRadius={22} />
        <View style={styles.skeletonActions}>
          <SkeletonLoader width="30%" height={40} borderRadius={12} />
          <SkeletonLoader width="60%" height={40} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e9ecef',
  },
  
  // Booking Card Skeleton Styles
  bookingCardSkeleton: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  
  skeletonPriorityStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: '#e9ecef',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingLeft: 28,
    paddingBottom: 16,
  },
  
  skeletonLeft: {
    flex: 1,
    paddingRight: 16,
  },
  
  skeletonMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  
  skeletonRight: {
    alignItems: 'flex-end',
  },
  
  skeletonActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    gap: 12,
  },
  
  skeletonActions: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
});

export default SkeletonLoader;