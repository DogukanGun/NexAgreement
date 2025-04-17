import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';

export type Activity = {
  id: number;
  type: 'purchase' | 'listing-created' | 'transaction';
  title: string;
  date: string;
  price?: string;
  value?: string;
  link: string;
};

type ActivityItemProps = {
  activity: Activity;
  className?: string;
};

export function ActivityItem({ activity, className = '' }: ActivityItemProps) {
  const typeLabels = {
    'purchase': 'Purchase',
    'listing-created': 'Listing Created',
    'transaction': 'Transaction'
  };

  const typeColors = {
    'purchase': 'bg-green-500/20 text-green-400',
    'listing-created': 'bg-blue-500/20 text-blue-400',
    'transaction': 'bg-purple-500/20 text-purple-400'
  };

  return (
    <Link href={activity.link} className={`block ${className}`}>
      <Card variant="glass" className="hover:bg-white/10 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <span className={`inline-block px-3 py-1 text-xs rounded-full mb-2 ${typeColors[activity.type]}`}>
              {typeLabels[activity.type]}
            </span>
            <h3 className="text-white font-medium">{activity.title}</h3>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-sm">{activity.date}</p>
            <p className="text-white font-medium">
              {activity.price || activity.value}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
} 