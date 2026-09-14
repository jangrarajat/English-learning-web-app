import { useCallback } from 'react';

export const useNotification = () => {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  const sendNotification = useCallback(async (title, options = {}) => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return false;

    try {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }, [requestPermission]);

  const sendTestNotification = useCallback(async () => {
    return sendNotification('📝 Time for your Verb Challenge!', {
      body: 'Don\'t forget to complete today\'s lesson and maintain your streak!'
    });
  }, [sendNotification]);

  const sendStreakNotification = useCallback(async (streak) => {
    return sendNotification(`🔥 ${streak} Day Streak!`, {
      body: `You're on fire! Keep going for ${streak} days in a row!`
    });
  }, [sendNotification]);

  const sendAchievementNotification = useCallback(async (badgeName) => {
    return sendNotification(`🏆 Achievement Unlocked!`, {
      body: `You earned: ${badgeName}!`
    });
  }, [sendNotification]);

  return {
    requestPermission,
    sendNotification,
    sendTestNotification,
    sendStreakNotification,
    sendAchievementNotification
  };
};