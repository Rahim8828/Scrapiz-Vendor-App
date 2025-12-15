import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
}

export function FadeInView({ children, duration = 300, delay = 0 }: FadeInViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
}

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  distance?: number;
}

export function SlideInView({ 
  children, 
  direction = 'up', 
  duration = 300, 
  delay = 0,
  distance = 50 
}: SlideInViewProps) {
  const slideAnim = useRef(new Animated.Value(distance)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.8,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, opacityAnim, duration, delay, distance]);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return [{ translateX: slideAnim }];
      case 'right':
        return [{ translateX: Animated.multiply(slideAnim, -1) }];
      case 'up':
        return [{ translateY: slideAnim }];
      case 'down':
        return [{ translateY: Animated.multiply(slideAnim, -1) }];
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return (
    <Animated.View 
      style={{ 
        opacity: opacityAnim,
        transform: getTransform()
      }}
    >
      {children}
    </Animated.View>
  );
}

interface ScaleInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
}

export function ScaleInView({ 
  children, 
  duration = 300, 
  delay = 0,
  initialScale = 0.8 
}: ScaleInViewProps) {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.8,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, duration, delay, initialScale]);

  return (
    <Animated.View 
      style={{ 
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }]
      }}
    >
      {children}
    </Animated.View>
  );
}

interface PulseViewProps {
  children: React.ReactNode;
  duration?: number;
  minScale?: number;
  maxScale?: number;
}

export function PulseView({ 
  children, 
  duration = 1000,
  minScale = 0.95,
  maxScale = 1.05 
}: PulseViewProps) {
  const pulseAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };

    pulse();
  }, [pulseAnim, duration, minScale, maxScale]);

  return (
    <Animated.View 
      style={{ 
        transform: [{ scale: pulseAnim }]
      }}
    >
      {children}
    </Animated.View>
  );
}

interface ShimmerViewProps {
  children: React.ReactNode;
  duration?: number;
}

export function ShimmerView({ children, duration = 1500 }: ShimmerViewProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        shimmerAnim.setValue(0);
        shimmer();
      });
    };

    shimmer();
  }, [shimmerAnim, duration]);

  return (
    <Animated.View 
      style={{ 
        opacity: Animated.add(0.3, Animated.multiply(shimmerAnim, 0.7))
      }}
    >
      {children}
    </Animated.View>
  );
}