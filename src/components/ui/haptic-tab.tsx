// import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
// import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

// Temporary fallback until navigation dependencies are installed
export function HapticTab(props: TouchableOpacityProps) {
  return (
    <TouchableOpacity
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
