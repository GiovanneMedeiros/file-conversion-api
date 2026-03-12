import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import clsx from 'clsx';

export const Alert = ({ type = 'info', title, message, className }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-100',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100',
  };

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
  };

  const Icon = icons[type];

  return (
    <div
      className={clsx(
        'flex items-start gap-3 border border-l-4 rounded-lg p-4',
        styles[type],
        className
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h3 className="font-medium">{title}</h3>}
        {message && <p className={title ? 'text-sm mt-1' : ''}>{message}</p>}
      </div>
    </div>
  );
};

export default Alert;
