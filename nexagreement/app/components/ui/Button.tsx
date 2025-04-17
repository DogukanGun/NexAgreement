import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  className?: string;
  href?: string;
  isLoading?: boolean;
};

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  href, 
  isLoading = false,
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold relative overflow-hidden transition-all';
  
  const variantStyles = {
    primary: 'dashboard-button', // Uses the global dashboard-button class
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
    outline: 'border border-white/10 bg-transparent text-white hover:bg-white/5',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400',
  };
  
  const buttonContent = (
    <>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      <span className={isLoading ? 'invisible' : ''}>{children}</span>
    </>
  );
  
  if (href) {
    return (
      <Link 
        href={href} 
        className={`${baseStyles} ${variantStyles[variant]} ${className} inline-block text-center`}
      >
        {buttonContent}
      </Link>
    );
  }
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {buttonContent}
    </button>
  );
} 