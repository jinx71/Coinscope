import React from 'react';

const VARIANTS = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-300 shadow-soft',
  secondary:
    'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 focus:ring-brand-200',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-200',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
  gold:
    'bg-gold-500 text-ink hover:bg-gold-600 focus:ring-gold-300 shadow-soft',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

const Button = React.forwardRef(function Button(
  {
    as: Tag = 'button',
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    loading = false,
    disabled = false,
    className = '',
    children,
    ...rest
  },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
  const cls = `${base} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`;
  return (
    <Tag ref={ref} className={cls} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </Tag>
  );
});

export default Button;
