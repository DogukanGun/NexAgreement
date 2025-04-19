import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';

type CategoryCardProps = {
  category: string;
  className?: string;
  onClick?: () => void;
};

export function CategoryCard({ category, className = '', onClick }: CategoryCardProps) {
  // Category-specific gradients
  const gradients: Record<string, string> = {
    'Commercial': 'from-blue-500/20 to-blue-700/20 border-blue-500/30',
    'Rental': 'from-purple-500/20 to-purple-700/20 border-purple-500/30',
    'Employment': 'from-green-500/20 to-green-700/20 border-green-500/30',
    'Partnership': 'from-yellow-500/20 to-yellow-700/20 border-yellow-500/30',
    'Real Estate': 'from-red-500/20 to-red-700/20 border-red-500/30'
  };

  const gradient = gradients[category] || 'from-blue-500/20 to-purple-500/20 border-blue-500/30';

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link 
      href={`/dashboard/marketplace?category=${category.toLowerCase()}`} 
      className={`block cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <Card variant="hover" className={`text-center h-full py-8 bg-gradient-to-br ${gradient}`}>
        <h3 className="text-xl font-medium text-white">{category}</h3>
        <p className="text-white/70 text-sm mt-2">Agreements</p>
      </Card>
    </Link>
  );
} 