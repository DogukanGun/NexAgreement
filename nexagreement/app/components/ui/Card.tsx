import { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  variant?: 'brutal' | 'glass';
  className?: string;
};

export function Card({ children, variant = 'brutal', className = '' }: CardProps) {
  const baseClass = variant === 'brutal' 
    ? 'card-brutal' 
    : 'card-glass';
    
  return (
    <div className={`${baseClass} p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-xl font-bold text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-white/70 ${className}`}>
      {children}
    </p>
  );
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex gap-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
} 