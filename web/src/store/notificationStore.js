import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now();
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id,
          type: 'info',
          duration: 3000,
          ...notification,
        },
      ],
    }));
    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  success: (message) => {
    return useNotificationStore.getState().addNotification({
      type: 'success',
      message,
    });
  },

  error: (message) => {
    return useNotificationStore.getState().addNotification({
      type: 'error',
      message,
      duration: 5000,
    });
  },

  info: (message) => {
    return useNotificationStore.getState().addNotification({
      type: 'info',
      message,
    });
  },
}));

export default useNotificationStore;
