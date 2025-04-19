import Link from 'next/link';

type StatCardProps = {
  title: string;
  value: string;
  href?: string;
  className?: string;
};

export function StatCard({ title, value, href, className = '' }: StatCardProps) {
  const content = (
    <div className="flex flex-col h-full justify-between p-6 rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm transition-all hover:bg-black/40 hover:border-white/20">
      <h3 className="text-lg font-medium text-white/70 mb-2">{title}</h3>
      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
        {value}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={`block h-full ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
} 