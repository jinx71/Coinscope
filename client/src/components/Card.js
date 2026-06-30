import React from 'react';

const Card = ({ as: Tag = 'div', className = '', children, ...rest }) => (
  <Tag
    className={`rounded-xl bg-white border border-slate-200/70 shadow-soft ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

export const CardHeader = ({ className = '', children }) => (
  <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ className = '', children }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);

export default Card;
