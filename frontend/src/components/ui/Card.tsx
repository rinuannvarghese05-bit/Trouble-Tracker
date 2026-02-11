import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-white rounded-2xl shadow-sm border border-slate-200/60 backdrop-blur-sm
      ${hover ? 'hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;