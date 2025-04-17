import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';

type CategoryCardProps = {
  category: string;
  className?: string;
};

export function CategoryCard({ category, className = '' }: CategoryCardProps) {
  return (
    <Link 
      href={`/dashboard/marketplace?category=${category.toLowerCase()}`} 
      className={`block ${className}`}
    >
      <Card variant="glass" className="text-center hover:bg-white/10 transition-all duration-200">
        <h3 className="text-lg font-medium text-white">{category}</h3>
        <p className="text-white/50 text-sm mt-1">Agreements</p>
      </Card>
    </Link>
  );
} 