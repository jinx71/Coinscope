import React from 'react';

const Spinner = ({ size = 'md', className = '', label = 'Loading…' }) => {
  const px = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size] || 'h-6 w-6';
  return (
    <div className={`inline-flex items-center gap-3 text-slate-500 ${className}`} role="status" aria-live="polite">
      <span
        className={`${px} animate-spin rounded-full border-2 border-brand-500 border-t-transparent`}
        aria-hidden="true"
      />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
};

export default Spinner;
