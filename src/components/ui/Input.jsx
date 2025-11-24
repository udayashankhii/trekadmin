import React from 'react';

const Input = ({ placeholder, type = 'text', icon, className = '', ...props }) => (
  <div className="relative">
    {icon && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </div>
    )}
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 ${icon ? 'pl-10' : ''} text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all ${className}`}
      {...props}
    />
  </div>
);

export default Input;
