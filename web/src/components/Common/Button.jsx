import clsx from 'clsx';

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  loading = false,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-amber-300 hover:bg-amber-200 text-stone-950 shadow-[0_12px_30px_rgba(252,211,77,0.22)]',
    secondary: 'bg-white/10 hover:bg-white/15 text-stone-100 border border-white/10',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'hover:bg-white/10 text-stone-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <span className="animate-spin">⏳</span>}
      {children}
    </button>
  );
};

export default Button;
