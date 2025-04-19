import { ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
};

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <Card className={`p-16 text-center ${className}`}>
      {icon && (
        <div className="mb-6">
          {icon}
        </div>
      )}
      {!icon && (
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-10 h-10 text-white/40"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
              />
            </svg>
          </div>
        </div>
      )}
      
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      {description && <p className="text-white/70 mb-8 max-w-md mx-auto">{description}</p>}
      
      {action && (
        <Button href={action.href} variant="primary">
          {action.label}
        </Button>
      )}
    </Card>
  );
} 