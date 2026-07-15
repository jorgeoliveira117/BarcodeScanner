import { useCallback, useState } from 'react';

export interface NotificationAction {
  text: string;
  onPress: () => void;
}

export interface NotificationState {
  visible: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
  actions?: NotificationAction[];
}

const DEFAULT_NOTIFICATION: NotificationState = {
  visible: false,
  message: '',
  type: 'success',
};

export const useNotification = () => {
  const [notification, setNotification] =
    useState<NotificationState>(DEFAULT_NOTIFICATION);

  const showNotification = useCallback(
    (
      message: string,
      type: 'success' | 'warning' | 'error' = 'success',
      actions?: NotificationAction[],
    ) => {
      setNotification({
        visible: true,
        message,
        type,
        actions,
      });
    },
    [],
  );

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    notification,
    setNotification,
    showNotification,
    hideNotification,
  };
};
