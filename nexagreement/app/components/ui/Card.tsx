import { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  variant?: 'default' | 'hover' | 'active';
  className?: string;
};

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const baseClasses = "rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm";
  
  // Apply additional classes based on variant
  const variantClasses = variant === 'hover' 
    ? 'transition-all hover:bg-black/40 hover:border-white/20' 
    : variant === 'active'
      ? 'bg-black/40 border-white/20'
      : '';
    
  return (
    <div className={`${baseClasses} ${variantClasses} p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-xl font-bold text-white mb-2 ${className}`}>
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
    <div className={`mt-4 flex gap-3 ${className}`}>
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