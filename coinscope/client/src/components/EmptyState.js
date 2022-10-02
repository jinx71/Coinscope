import React from 'react';

const EmptyState = ({ title = 'Nothing here yet', message, action, icon }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
    <div className="h-14 w-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl">
      {icon || '✨'}
    </div>
    <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
    {message && <p className="mt-1 text-sm text-slate-500 max-w-md">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
