export async function feedback(kind: 'selection' | 'success' | 'warning') {
  try {
    // Lazy loading lets older development clients still open before their next rebuild.
    const haptics = await import('expo-haptics');
    if (kind === 'selection') await haptics.selectionAsync();
    else
      await haptics.notificationAsync(
        kind === 'warning'
          ? haptics.NotificationFeedbackType.Warning
          : haptics.NotificationFeedbackType.Success,
      );
  } catch {
    // Tactile feedback is optional; it must never interrupt entering or saving scores.
  }
}
