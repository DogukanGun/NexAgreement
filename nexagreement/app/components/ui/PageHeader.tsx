import { Button } from './Button';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
};

export function PageHeader({ title, description, action, className = '' }: PageHeaderProps) {
  return (
    <header className={`mb-10 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="dashboard-heading mb-3">{title}</h1>
          {description && <p className="dashboard-subheading">{description}</p>}
        </div>
        {action && (
          <Button href={action.href} variant="primary">
            {action.label}
          </Button>
        )}
      </div>
    </header>
  );
} 