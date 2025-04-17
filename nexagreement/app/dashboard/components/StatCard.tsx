import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';

type StatCardProps = {
  title: string;
  value: string;
  href?: string;
  className?: string;
};

export function StatCard({ title, value, href, className = '' }: StatCardProps) {
  const content = (
    <>
      <h3 className="text-lg text-white/70 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        <Card className="hover:shadow-lg transition-shadow">
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card className={className}>
      {content}
    </Card>
  );
} 