// Push Notification Setup

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
      )
    });
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export function showNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      ...options
    });
  }
}

export function showMealReminder(mealType) {
  showNotification(`Time to log your ${mealType}!`, {
    body: 'Consistent tracking leads to better results 🎯',
    tag: 'meal-reminder',
    requireInteraction: false
  });
}

export function showStreakNotification(days) {
  showNotification('Streak Alert! 🔥', {
    body: `You're on a ${days}-day logging streak! Keep it up!`,
    tag: 'streak',
    requireInteraction: false
  });
}

export function showGoalAchievement(goalName) {
  showNotification('Goal Achieved! 🎉', {
    body: `Congratulations! You completed: ${goalName}`,
    tag: 'goal-achieved',
    requireInteraction: true
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}