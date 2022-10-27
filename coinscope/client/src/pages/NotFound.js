import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => (
  <div className="py-20 text-center">
    <p className="text-6xl">🧭</p>
    <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Page not found</h1>
    <p className="mt-2 text-slate-500">
      The page you're looking for doesn't exist or has moved.
    </p>
    <div className="mt-6">
      <Button as={Link} to="/">
        Back to markets
      </Button>
    </div>
  </div>
);

export default NotFound;
