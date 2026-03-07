import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:border-indigo-300' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
