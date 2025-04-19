import Link from 'next/link';

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
    'purchase': 'bg-green-500/20 text-green-400 border-green-500/30',
    'listing-created': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'transaction': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  return (
    <Link href={activity.link} className={`block ${className}`}>
      <div className="p-5 rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm hover:bg-black/40 hover:border-white/20 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <span className={`inline-block px-3 py-1 text-xs rounded-full mb-3 border ${typeColors[activity.type]}`}>
              {typeLabels[activity.type]}
            </span>
            <h3 className="text-white font-medium text-lg">{activity.title}</h3>
          </div>
          <div className="text-right ml-4">
            <p className="text-white/50 text-sm mb-1">{activity.date}</p>
            <p className={`text-lg font-semibold ${activity.value && activity.value.startsWith('+') ? 'text-green-400' : 'text-white'}`}>
              {activity.price || activity.value}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
} 