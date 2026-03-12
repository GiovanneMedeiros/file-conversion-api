import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

const NotificationItem = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
  };

  useEffect(() => {
    if (notification.duration) {
      const timeout = setTimeout(() => {
        onClose(notification.id);
      }, notification.duration);
      return () => clearTimeout(timeout);
    }
  }, [notification, onClose]);

  return (
    <div
      className={`flex items-center gap-3 border rounded-lg p-4 ${
        colors[notification.type]
      }`}
    >
      {icons[notification.type]}
      <p className="flex-1 text-sm font-medium">{notification.message}</p>
      <button
        onClick={() => onClose(notification.id)}
        className="p-1 hover:bg-black/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const NotificationContainer = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm pointer-events-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
