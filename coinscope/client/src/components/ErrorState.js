import React from 'react';
import Button from './Button';

const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center py-10 px-6">
    <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl">
      !
    </div>
    <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
    {message && <p className="mt-1 text-sm text-slate-500 max-w-md">{message}</p>}
    {onRetry && (
      <div className="mt-5">
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    )}
  </div>
);

export default ErrorState;
