import { X } from 'lucide-react';
import clsx from 'clsx';
import Button from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div
        className={clsx(
          'fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
          'bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4',
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">{children}</div>

        {footer && (
          <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

export default Modal;
