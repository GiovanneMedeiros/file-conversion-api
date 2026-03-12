import clsx from 'clsx';

export const Input = ({
  label,
  error,
  className,
  type = 'text',
  fullWidth = true,
  ...props
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={clsx(
          'px-4 py-2 border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100',
          'disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
