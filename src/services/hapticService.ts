import * as Haptics from 'expo-haptics';

export class HapticService {
  static async light() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available on this device
      console.log('Haptics not available');
    }
  }

  static async medium() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  static async heavy() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  static async success() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  static async warning() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  static async error() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  static async selection() {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptics not available');
    }
  }
}

export default HapticService;