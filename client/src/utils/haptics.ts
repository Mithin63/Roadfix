/**
 * Roadfix Mobile Haptic & Vibration Utility
 * Provides subtle tactile feedback for roadside dispatch interactions
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      if (type === 'heavy') {
        navigator.vibrate(25);
      } else if (type === 'medium') {
        navigator.vibrate(18);
      } else {
        // 10-12ms crisp tap feedback for confirmations & interactions
        navigator.vibrate(12);
      }
    } catch {
      // Ignore vibration errors if disabled by browser policies
    }
  }
}
