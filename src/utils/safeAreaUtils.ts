import { Dimensions, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Safe area dimensions utility
export const getSafeAreaDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
  
  return {
    window: { width, height },
    screen: { width: screenWidth, height: screenHeight },
    isFullScreen: height === screenHeight,
  };
};

// Android navigation bar detection
export const getAndroidNavigationBarHeight = () => {
  if (Platform.OS !== 'android') return 0;
  
  const { window, screen } = getSafeAreaDimensions();
  const navigationBarHeight = screen.height - window.height - (StatusBar.currentHeight || 0);
  
  // Common Android navigation bar heights
  // Gesture navigation: 0-10px
  // Button navigation: 48-56px
  // Some devices: 72px
  return Math.max(0, navigationBarHeight);
};

// Device-specific safe area calculations
export const getDeviceSafeArea = () => {
  const androidNavHeight = getAndroidNavigationBarHeight();
  
  return {
    top: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
    bottom: Platform.OS === 'ios' ? 34 : Math.max(androidNavHeight, 16), // Minimum 16px padding
    left: 0,
    right: 0,
  };
};

// Hook for safe area with Android navigation handling
export const useSafeAreaWithNavigation = () => {
  const insets = useSafeAreaInsets();
  const deviceSafeArea = getDeviceSafeArea();
  
  return {
    top: Math.max(insets.top, deviceSafeArea.top),
    bottom: Math.max(insets.bottom, deviceSafeArea.bottom),
    left: Math.max(insets.left, deviceSafeArea.left),
    right: Math.max(insets.right, deviceSafeArea.right),
  };
};

// Bottom navigation safe area specifically
export const getBottomNavigationSafeArea = () => {
  const androidNavHeight = getAndroidNavigationBarHeight();
  const basePadding = 16; // Base padding for design
  
  if (Platform.OS === 'android') {
    // Handle different Android navigation types
    if (androidNavHeight === 0) {
      // Gesture navigation - add extra padding for gesture area
      return basePadding + 12;
    } else if (androidNavHeight <= 10) {
      // Thin gesture bar
      return basePadding + androidNavHeight + 8;
    } else {
      // Button navigation
      return basePadding + androidNavHeight + 4;
    }
  }
  
  // iOS safe area
  return basePadding + 34; // iOS home indicator
};

// Dynamic padding based on device
export const getDynamicBottomPadding = (baseValue: number = 16) => {
  const safeArea = getBottomNavigationSafeArea();
  return Math.max(baseValue, safeArea);
};

// Check if device has gesture navigation
export const hasGestureNavigation = () => {
  if (Platform.OS !== 'android') return false;
  const navHeight = getAndroidNavigationBarHeight();
  return navHeight <= 10;
};

// Check if device has button navigation
export const hasButtonNavigation = () => {
  if (Platform.OS !== 'android') return false;
  const navHeight = getAndroidNavigationBarHeight();
  return navHeight > 40; // Typical button navigation height
};

// Get Android navigation type
export const getAndroidNavigationType = () => {
  if (Platform.OS !== 'android') return 'none';
  const navHeight = getAndroidNavigationBarHeight();
  
  if (navHeight === 0) return 'gesture-full';
  if (navHeight <= 10) return 'gesture-bar';
  if (navHeight <= 48) return 'button-small';
  return 'button-large';
};

// Debug function to log safe area information (for development)
export const logSafeAreaInfo = () => {
  if (__DEV__) {
    const androidNavHeight = getAndroidNavigationBarHeight();
    const navType = getAndroidNavigationType();
    const safeArea = getBottomNavigationSafeArea();
    const dimensions = getSafeAreaDimensions();
    
    console.log('🔧 Safe Area Debug Info:', {
      platform: Platform.OS,
      androidNavHeight,
      navType,
      bottomSafeArea: safeArea,
      dimensions,
      hasGesture: hasGestureNavigation(),
      hasButton: hasButtonNavigation(),
    });
  }
};

// Get appropriate margin for floating elements
export const getFloatingElementMargin = () => {
  const bottomSafeArea = getBottomNavigationSafeArea();
  return {
    bottom: bottomSafeArea + 8, // Extra margin for floating elements
  };
};

// Get safe bottom padding for scroll content with bottom navigation
export const getScrollContentBottomPadding = () => {
  const bottomNavHeight = 72; // Standard bottom navigation height
  const safeArea = getBottomNavigationSafeArea();
  return Math.max(120, bottomNavHeight + safeArea + 16); // Ensure minimum 120px or safe area + nav height
};

// Get safe area for modal/overlay content
export const getModalSafeArea = () => {
  const deviceSafeArea = getDeviceSafeArea();
  return {
    paddingTop: deviceSafeArea.top,
    paddingBottom: deviceSafeArea.bottom,
    paddingLeft: deviceSafeArea.left,
    paddingRight: deviceSafeArea.right,
  };
};